import os
import sys
import uuid
import io

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

SAMPLE_PDF_BYTES = b"""%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length 200 >> stream
BT
/F1 14 Tf
50 700 Td
(Chapter 1: Linux & Shell Scripting) Tj
0 -30 Td
(Chapter 2: Docker Containerization Engine) Tj
0 -30 Td
(Chapter 3: Kubernetes Cluster Operations) Tj
0 -30 Td
(Chapter 4: CI CD Pipeline Automation) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000234 00000 n 
0000000305 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
487
%%EOF
"""


def test_phase2_universal_study_engine():
    unique_suffix = str(uuid.uuid4())[:8]
    email = f"architect_{unique_suffix}@studyos.com"
    pwd = "SecurePassword123!"

    # 1. Register User
    reg_resp = client.post("/api/auth/register", json={"email": email, "password": pwd})
    assert reg_resp.status_code == 201
    auth_data = reg_resp.json()
    token = auth_data["access_token"]
    user_id = auth_data["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✓ Registered test user ({email})")

    # 2. Test Text-to-StudySpace Generation
    gen_text_payload = {
        "text": "Linux Administration, Docker Fundamentals, Kubernetes Cluster, Terraform Infrastructure",
        "title": "Cloud DevOps Track",
        "category": "DevOps & Cloud"
    }
    resp = client.post("/api/study-spaces/generate-from-text", json=gen_text_payload, headers=headers)
    assert resp.status_code == 201, f"Generate from text failed: {resp.text}"
    space_data = resp.json()
    space_id = space_data["id"]
    assert space_data["title"] == "Cloud DevOps Track"
    print("✓ Successfully generated StudySpace from plain text input")

    # 3. Test React Flow MindMap Graph Fetch
    resp = client.get(f"/api/mindmap?study_space_id={space_id}", headers=headers)
    assert resp.status_code == 200, resp.text
    graph_data = resp.json()
    assert len(graph_data["nodes"]) >= 4
    assert len(graph_data["edges"]) >= 3
    first_node = graph_data["nodes"][0]
    assert "position" in first_node
    assert "x" in first_node["position"] and "y" in first_node["position"]
    assert "competency_count" in first_node["data"]
    print(f"✓ React Flow MindMap graph loaded with {len(graph_data['nodes'])} nodes and {len(graph_data['edges'])} edges")

    # 4. Test Node Position Persistence (Drag & Drop)
    node_id = first_node["id"]
    pos_payload = {"position_x": 520.5, "position_y": 140.0}
    resp = client.put(f"/api/mindmap/nodes/{node_id}/position", json=pos_payload, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["position"]["x"] == 520.5
    print("✓ Persisted node drag coordinates on canvas")

    # 5. Test Competency Gate: Marking COMPLETE without evidence must fail
    status_payload = {"status": "COMPLETE", "progress": 100}
    resp = client.patch(f"/api/topics/{node_id}/status", json=status_payload, headers=headers)
    assert resp.status_code == 400, f"Expected 400 for lack of competency evidence, got {resp.status_code}: {resp.text}"
    err_detail = resp.json()["detail"]
    assert "Competency Gate Blocked" in err_detail
    print("✓ Competency Gate successfully blocked completion with 0 evidence")

    # 6. Retrieve Topic Competency Items and complete one
    resp = client.get(f"/api/topics/{node_id}", headers=headers)
    assert resp.status_code == 200
    topic_data = resp.json()
    assert len(topic_data["competencies"]) > 0
    first_comp = topic_data["competencies"][0]
    comp_id = first_comp["id"]

    # Toggle competency item to completed
    resp = client.patch(f"/api/topics/{node_id}/competencies/{comp_id}/toggle", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["is_completed"] is True
    print("✓ Completed a verified competency item on topic")

    # Now attempt completion again -> MUST SUCCEED
    resp = client.patch(f"/api/topics/{node_id}/status", json=status_payload, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "COMPLETE"
    print("✓ Topic successfully marked COMPLETE after satisfying competency evidence")

    # 7. Test Anti-Fake-Progress Velocity Monitor
    # Rapidly complete remaining topics in space without study time
    remaining_nodes = graph_data["nodes"][1:]
    for node in remaining_nodes:
        n_id = node["id"]
        # Fetch comps and complete one
        t_resp = client.get(f"/api/topics/{n_id}", headers=headers)
        if t_resp.status_code == 200 and t_resp.json()["competencies"]:
            c_id = t_resp.json()["competencies"][0]["id"]
            client.patch(f"/api/topics/{n_id}/competencies/{c_id}/toggle", headers=headers)
            # Mark intermediate topic complete
            if n_id != remaining_nodes[-1]["id"]:
                client.patch(f"/api/topics/{n_id}/status", json=status_payload, headers=headers)

    # Attempt to complete final node -> Should trigger warning flag!
    last_node_id = remaining_nodes[-1]["id"]
    resp = client.patch(f"/api/topics/{last_node_id}/status", json=status_payload, headers=headers)
    assert resp.status_code == 200
    res_data = resp.json()
    assert res_data["anti_fake_progress_warning"] is True
    assert "Anti-Fake-Progress" in res_data["warning_message"]
    print("✓ Anti-Fake-Progress Velocity Monitor successfully triggered warning flag")

    # 8. Test Document Processing Pipeline: Upload PDF
    files = {
        "file": ("backend-roadmap.pdf", io.BytesIO(SAMPLE_PDF_BYTES), "application/pdf")
    }
    data = {
        "title": "Backend Engineering Roadmap PDF",
        "study_space_id": space_id
    }
    resp = client.post("/api/materials/upload", files=files, data=data, headers=headers)
    assert resp.status_code == 201, resp.text
    material_data = resp.json()
    mat_id = material_data["id"]
    assert material_data["checksum_hash"]
    assert material_data["page_count"] >= 1
    assert material_data["file_type"] == "PDF"
    print(f"✓ Uploaded and parsed PDF (SHA-256: {material_data['checksum_hash'][:16]}..., Pages: {material_data['page_count']})")

    # 9. Test PDF -> StudySpace Course Generator with Source Grounding
    mat_gen_payload = {
        "material_id": mat_id,
        "title": "Backend Roadmap Extracted Space"
    }
    resp = client.post("/api/study-spaces/generate-from-material", json=mat_gen_payload, headers=headers)
    assert resp.status_code == 201, resp.text
    pdf_space = resp.json()
    pdf_space_id = pdf_space["id"]

    # Verify MindMap for extracted PDF space
    resp = client.get(f"/api/mindmap?study_space_id={pdf_space_id}", headers=headers)
    assert resp.status_code == 200
    pdf_graph = resp.json()
    assert len(pdf_graph["nodes"]) >= 3
    # Verify source grounding
    grounded_node = next((n for n in pdf_graph["nodes"] if n["data"]["origin"] == "SOURCE_CONFIRMED"), None)
    assert grounded_node is not None
    assert "backend-roadmap.pdf" in grounded_node["data"]["source_reference"]
    print(f"✓ PDF Course Generator produced grounded StudySpace: {grounded_node['data']['source_reference']}")

    # 10. Test Circular Dependency Prevention
    first_id = pdf_graph["nodes"][0]["id"]
    second_id = pdf_graph["nodes"][1]["id"]
    # Edge A -> B
    client.post("/api/mindmap/dependencies", json={"source_topic_id": first_id, "target_topic_id": second_id}, headers=headers)
    # Attempt reverse Edge B -> A
    resp = client.post("/api/mindmap/dependencies", json={"source_topic_id": second_id, "target_topic_id": first_id}, headers=headers)
    assert resp.status_code == 400
    assert "Circular dependency" in resp.json()["detail"]
    print("✓ Circular dependency properly detected and rejected")


if __name__ == "__main__":
    print("Starting StudyOS v1.3.1 Phase 2 Universal Engine Verification Suite...")
    test_phase2_universal_study_engine()
    print("\n🎉 ALL PHASE 2 TESTS PASSED SUCCESSFULLY!")
