import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  ProgressBar,
  Table,
  Badge,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const DashboardHome = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5002/api/dashboard")
      .then((res) => setMetrics(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!metrics) return <p>Unable to load dashboard.</p>;

  const {
    totalPatients,
    dailyLoggingRate,
    avgLogsPerPatient,
    lowEngagement,
    highRisk,
    overdue,
  } = metrics;

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col md={4}>
          <Card bg="primary" text="white" className="text-center">
            <Card.Body>
              <Card.Title>Total Patients</Card.Title>
              <h2>{totalPatients}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card bg="success" text="white" className="text-center">
            <Card.Body>
              <Card.Title>Daily Logging Rate</Card.Title>
              <ProgressBar
                now={dailyLoggingRate}
                label={<span style={{ color: "#000", fontWeight: "bold" }}>{dailyLoggingRate.toFixed(1)}%</span>}
                animated
                variant="warning"
                style={{ height: "1.5rem" }}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card bg="warning" text="dark" className="text-center">
            <Card.Body>
              <Card.Title>Avg Logs / Patient (7d)</Card.Title>
              <h2>{avgLogsPerPatient.toFixed(1)}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={6} className="mb-4">
          <Card border="info">
            <Card.Header className="bg-info text-white">
              Low Engagement (&lt;3 logs/week)
            </Card.Header>
            <Card.Body style={{ maxHeight: 300, overflowY: "auto" }}>
              <Table hover size="sm" responsive>
                <thead className="table-light">
                  <tr>
                    <th>Patient</th>
                    <th>Logs</th>
                  </tr>
                </thead>
                <tbody>
                  {lowEngagement.map((p) => (
                    <tr key={p.uid}>
                      <td>{p.name}</td>
                      <td>{p.logsLastWeek}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card border="danger">
            <Card.Header className="bg-danger text-white">
              High-Risk Events (last 24 h)
            </Card.Header>
            <Card.Body style={{ maxHeight: 300, overflowY: "auto" }}>
              <Table hover size="sm" responsive>
                <thead className="table-light">
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Pain</th>
                    <th>Stress</th>
                  </tr>
                </thead>
                <tbody>
                  {highRisk.map((e, i) => (
                    <tr key={i}>
                      <td>{e.name}</td>
                      <td>{e.date}</td>
                      <td><Badge bg="dark">{e.pain}</Badge></td>
                      <td><Badge bg="dark">{e.stress}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card border="secondary">
            <Card.Header className="bg-secondary text-white">
              Overdue for Follow-Up (&gt;7 days)
            </Card.Header>
            <Card.Body style={{ maxHeight: 300, overflowY: "auto" }}>
              <Table hover size="sm" responsive>
                <thead className="table-light">
                  <tr>
                    <th>Patient</th>
                    <th>Last Log</th>
                  </tr>
                </thead>
                <tbody>
                  {overdue.map((p, i) => (
                    <tr key={i}>
                      <td>{p.name}</td>
                      <td>{p.lastLog ?? "No logs yet"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardHome;
