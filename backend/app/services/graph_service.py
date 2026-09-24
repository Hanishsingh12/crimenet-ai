import logging
from typing import List, Dict, Any, Optional
import networkx as nx
from neo4j import GraphDatabase, exceptions as neo4j_exceptions
from app.config import settings

logger = logging.getLogger("crimenet.graph_service")

class GraphService:
    def __init__(self):
        self.driver = None
        self.neo4j_available = False
        self._init_neo4j()
        
        # Resilient In-Memory NetworkX Graph Stores (keyed by case_id)
        # Guarantees that whether Neo4j server is running or offline, all graph features work 100%
        self.nx_graphs: Dict[str, nx.MultiGraph] = {}
        self.node_metadata: Dict[str, Dict[str, Any]] = {}
        self.edge_metadata: Dict[str, Dict[str, Any]] = {}

    def _init_neo4j(self):
        try:
            self.driver = GraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD),
                connection_timeout=2
            )
            self.driver.verify_connectivity()
            self.neo4j_available = True
            logger.info(f"Connected to Neo4j at {settings.NEO4J_URI}")
        except Exception as e:
            self.neo4j_available = False
            logger.warning(
                f"Neo4j is not available ({e}). Graph service running in robust high-performance in-memory mode."
            )

    def is_connected(self) -> bool:
        return self.neo4j_available

    def _get_nx(self, case_id: str) -> nx.MultiGraph:
        if case_id not in self.nx_graphs or len(self.nx_graphs[case_id]) == 0:
            if case_id not in self.nx_graphs:
                self.nx_graphs[case_id] = nx.MultiGraph()
            # Auto-seed graph relationships for case if empty
            try:
                from app.utils.seed import build_graph_relationships
                build_graph_relationships(case_id)
            except Exception:
                pass
        return self.nx_graphs[case_id]

    def add_node(self, case_id: str, node_id: str, label: str, node_type: str, properties: Optional[Dict[str, Any]] = None):
        props = properties or {}
        node_info = {
            "id": node_id,
            "label": label,
            "type": node_type,
            "case_id": case_id,
            "properties": props
        }
        self.node_metadata[node_id] = node_info
        G = self._get_nx(case_id)
        G.add_node(node_id, **node_info)

        # Sync to Neo4j if online
        if self.neo4j_available and self.driver:
            try:
                with self.driver.session() as session:
                    cypher = f"""
                    MERGE (n:{node_type} {{id: $node_id}})
                    SET n.label = $label, n.case_id = $case_id, n += $props
                    """
                    session.run(cypher, node_id=node_id, label=label, case_id=case_id, props=props)
            except Exception as e:
                logger.debug(f"Neo4j node sync skipped: {e}")

    def add_relationship(
        self,
        case_id: str,
        source_id: str,
        target_id: str,
        rel_type: str,
        confidence: float = 0.90,
        properties: Optional[Dict[str, Any]] = None,
        source_document: Optional[str] = None,
        date: Optional[str] = None
    ):
        edge_id = f"{source_id}_{rel_type}_{target_id}"
        props = properties or {}
        edge_info = {
            "id": edge_id,
            "source": source_id,
            "target": target_id,
            "type": rel_type,
            "label": rel_type.replace("_", " ").title(),
            "confidence": confidence,
            "source_document": source_document or "DOC-AUTO",
            "date": date or "2026-02-15",
            "case_id": case_id,
            "properties": props
        }
        self.edge_metadata[edge_id] = edge_info
        G = self._get_nx(case_id)
        G.add_edge(source_id, target_id, key=rel_type, **edge_info)

        # Sync to Neo4j if online
        if self.neo4j_available and self.driver:
            try:
                with self.driver.session() as session:
                    cypher = f"""
                    MATCH (s {{id: $source_id}}), (t {{id: $target_id}})
                    MERGE (s)-[r:{rel_type}]->(t)
                    SET r.id = $edge_id, r.confidence = $confidence,
                        r.source_document = $source_document, r.date = $date,
                        r.case_id = $case_id, r += $props
                    """
                    session.run(
                        cypher,
                        source_id=source_id,
                        target_id=target_id,
                        edge_id=edge_id,
                        confidence=confidence,
                        source_document=source_document,
                        date=date,
                        case_id=case_id,
                        props=props
                    )
            except Exception as e:
                logger.debug(f"Neo4j rel sync skipped: {e}")

    def get_case_graph(self, case_id: str, limit: int = 500) -> Dict[str, Any]:
        G = self._get_nx(case_id)
        nodes = []
        for n, data in G.nodes(data=True):
            meta = self.node_metadata.get(n, data)
            nodes.append({
                "id": n,
                "label": meta.get("label", n),
                "type": meta.get("type", "Entity"),
                "cluster": meta.get("cluster", "Cluster A"),
                "properties": meta.get("properties", {}),
                "degree": G.degree(n),
                "betweenness": meta.get("betweenness", 0.0),
                "pagerank": meta.get("pagerank", 0.0)
            })

        edges = []
        for u, v, k, data in G.edges(data=True, keys=True):
            edges.append({
                "id": data.get("id", f"{u}_{k}_{v}"),
                "source": u,
                "target": v,
                "type": data.get("type", k),
                "label": data.get("label", k.replace("_", " ")),
                "confidence": data.get("confidence", 0.85),
                "date": data.get("date", "2026-01-01"),
                "source_document": data.get("source_document", "DOC-REF"),
                "properties": data.get("properties", {})
            })

        return {
            "case_id": case_id,
            "nodes": nodes[:limit],
            "edges": edges[:limit * 2],
            "stats": {
                "nodes_count": len(nodes),
                "edges_count": len(edges)
            }
        }

    def get_neighbors(self, entity_id: str, max_depth: int = 1, case_id: Optional[str] = None) -> Dict[str, Any]:
        target_case = case_id or settings.DEFAULT_CASE_ID
        G = self._get_nx(target_case)
        if entity_id not in G:
            return {"nodes": [], "edges": []}

        # Subgraph up to max_depth
        sub_nodes = set([entity_id])
        current_layer = set([entity_id])
        for _ in range(max_depth):
            next_layer = set()
            for node in current_layer:
                for neighbor in G.neighbors(node):
                    if neighbor not in sub_nodes:
                        next_layer.add(neighbor)
                        sub_nodes.add(neighbor)
            current_layer = next_layer

        sub_G = G.subgraph(sub_nodes)
        nodes = []
        for n in sub_G.nodes():
            meta = self.node_metadata.get(n, {})
            nodes.append({
                "id": n,
                "label": meta.get("label", n),
                "type": meta.get("type", "Entity"),
                "cluster": meta.get("cluster", "Cluster A"),
                "properties": meta.get("properties", {}),
                "degree": G.degree(n)
            })

        edges = []
        for u, v, k, data in sub_G.edges(data=True, keys=True):
            edges.append({
                "id": data.get("id", f"{u}_{k}_{v}"),
                "source": u,
                "target": v,
                "type": data.get("type", k),
                "label": data.get("label", k),
                "confidence": data.get("confidence", 0.9)
            })

        return {"nodes": nodes, "edges": edges}

    def find_shortest_path(self, source_id: str, target_id: str, max_depth: int = 5, case_id: Optional[str] = None) -> Dict[str, Any]:
        target_case = case_id or settings.DEFAULT_CASE_ID
        G = self._get_nx(target_case)

        if source_id not in G or target_id not in G:
            return {"found": False, "paths": [], "message": "Source or target node not found in graph."}

        try:
            # Simple conversion to Graph for path finding
            simple_G = nx.Graph(G)
            all_paths = list(nx.all_simple_paths(simple_G, source=source_id, target=target_id, cutoff=max_depth))
            if not all_paths:
                return {"found": False, "paths": [], "message": f"No path found within {max_depth} hops."}

            # Sort by length
            all_paths.sort(key=len)
            best_paths = all_paths[:3]

            formatted_paths = []
            for path in best_paths:
                path_nodes = []
                path_edges = []
                evidence_list = []

                for i, node_id in enumerate(path):
                    meta = self.node_metadata.get(node_id, {})
                    path_nodes.append({
                        "id": node_id,
                        "label": meta.get("label", node_id),
                        "type": meta.get("type", "Entity"),
                        "cluster": meta.get("cluster", "Cluster A"),
                        "properties": meta.get("properties", {})
                    })

                    if i < len(path) - 1:
                        u = path[i]
                        v = path[i + 1]
                        # Fetch edge data from G
                        edge_dict = G.get_edge_data(u, v)
                        if edge_dict:
                            first_key = list(edge_dict.keys())[0]
                            e_data = edge_dict[first_key]
                            path_edges.append({
                                "id": e_data.get("id", f"{u}_{v}"),
                                "source": u,
                                "target": v,
                                "type": e_data.get("type", "CONNECTED_TO"),
                                "label": e_data.get("label", "Connected"),
                                "confidence": e_data.get("confidence", 0.9)
                            })
                            doc = e_data.get("source_document")
                            if doc and doc not in evidence_list:
                                evidence_list.append(doc)

                formatted_paths.append({
                    "nodes": path_nodes,
                    "relationships": path_edges,
                    "evidence": evidence_list,
                    "total_hops": len(path) - 1
                })

            return {"found": True, "paths": formatted_paths, "message": f"Found {len(formatted_paths)} relationship paths."}
        except Exception as e:
            logger.error(f"Error computing path: {e}")
            return {"found": False, "paths": [], "message": str(e)}

graph_service = GraphService()
