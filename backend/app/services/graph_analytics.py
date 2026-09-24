import logging
from typing import Dict, List, Any
import networkx as nx
from networkx.algorithms.community import greedy_modularity_communities
from app.services.graph_service import graph_service

logger = logging.getLogger("crimenet.analytics")

class GraphAnalytics:
    @staticmethod
    def compute_centrality(case_id: str) -> List[Dict[str, Any]]:
        G = graph_service._get_nx(case_id)
        if len(G) == 0:
            return []

        # Convert to simple undirected graph for centrality algorithms
        simple_G = nx.Graph(G)
        
        # Degree centrality
        deg_centrality = nx.degree_centrality(simple_G)
        
        # Betweenness centrality
        try:
            bet_centrality = nx.betweenness_centrality(simple_G)
        except Exception:
            bet_centrality = {n: 0.0 for n in simple_G.nodes()}
            
        # PageRank
        try:
            pagerank = nx.pagerank(simple_G, alpha=0.85, max_iter=200)
        except Exception:
            pagerank = {n: 0.0 for n in simple_G.nodes()}

        results = []
        for node_id in simple_G.nodes():
            meta = graph_service.node_metadata.get(node_id, {})
            deg = simple_G.degree(node_id)
            bet = round(bet_centrality.get(node_id, 0.0), 4)
            pr = round(pagerank.get(node_id, 0.0), 4)

            # Store computed metrics back into metadata for easy access
            meta["degree"] = deg
            meta["betweenness"] = bet
            meta["pagerank"] = pr

            # Respectful, analytical classification (strictly no "gang leader" or "criminal" labels)
            if bet > 0.15 and deg > 4:
                analytical_label = "Bridge entity (High Cross-Cluster Centrality)"
            elif deg >= 8 or pr > 0.05:
                analytical_label = "High network centrality (Prominent Hub)"
            elif deg >= 4:
                analytical_label = "Highly connected entity"
            else:
                analytical_label = "Standard network participant"

            results.append({
                "entity_id": node_id,
                "name": meta.get("label", node_id),
                "type": meta.get("type", "Entity"),
                "degree": deg,
                "betweenness": bet,
                "pagerank": pr,
                "analytical_label": analytical_label
            })

        # Sort by degree and pagerank
        results.sort(key=lambda x: (x["degree"], x["betweenness"]), reverse=True)
        return results

    @staticmethod
    def detect_communities(case_id: str) -> List[Dict[str, Any]]:
        G = graph_service._get_nx(case_id)
        if len(G) == 0:
            return []

        simple_G = nx.Graph(G)
        try:
            communities = list(greedy_modularity_communities(simple_G))
        except Exception as e:
            logger.warning(f"Community detection fallback: {e}")
            communities = [set(simple_G.nodes())]

        palette = [
            "#38bdf8", # sky
            "#818cf8", # indigo
            "#34d399", # emerald
            "#fbbf24", # amber
            "#f472b6", # pink
            "#a78bfa", # violet
            "#2dd4bf", # teal
            "#fb923c"  # orange
        ]

        clusters = []
        for i, comm in enumerate(communities):
            char_label = chr(ord('A') + i) if i < 26 else f"C{i+1}"
            cluster_id = f"cluster_{char_label.lower()}"
            cluster_name = f"Cluster {char_label}"
            color = palette[i % len(palette)]
            members = list(comm)

            # Assign cluster to node metadata
            for m in members:
                if m in graph_service.node_metadata:
                    graph_service.node_metadata[m]["cluster"] = cluster_name
                    graph_service.node_metadata[m]["cluster_color"] = color

            clusters.append({
                "cluster_id": cluster_id,
                "cluster_name": cluster_name,
                "color": color,
                "member_ids": members,
                "size": len(members),
                "dominant_type": "Mixed Investigation Entities"
            })

        clusters.sort(key=lambda x: x["size"], reverse=True)
        return clusters

graph_analytics = GraphAnalytics()
