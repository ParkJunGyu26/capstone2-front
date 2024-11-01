import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://13.125.153.61:8080" // EC2의 도커 포트
    : "http://13.125.153.61:8080"; // 프로덕션 환경도 동일

const TeacherDashboard = () => {
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 유닛 목록 가져오기
  useEffect(() => {
    console.log("Current API_URL:", API_URL);
    const fetchUnits = async () => {
      try {
        console.log("Fetching from:", `${API_URL}/api/units`);
        const response = await fetch(`${API_URL}/api/units`, {
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUnits(data);
        if (data.length > 0) {
          setSelectedUnit(data[0].worldId);
        }
      } catch (error) {
        console.error("Error fetching units:", error);
        setError(`유닛 정보를 불러오는데 실패했습니다. (${error.message})`);
      }
    };

    fetchUnits();
  }, []);

  // 대시보드 데이터 가져오기 함수
  const fetchDashboardData = async () => {
    if (!selectedUnit) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/progress/dashboard/${selectedUnit}`,
        {
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDashboardData(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("데이터를 불러오는데 실패했습니다.");
      setIsLoading(false);
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    fetchDashboardData();
  }, [selectedUnit]);

  // 5초마다 데이터 갱신
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 5000); // 5초마다 갱신

    return () => clearInterval(intervalId); // cleanup
  }, [selectedUnit]);

  if (error) return <div>{error}</div>;
  if (isLoading) return <div>로딩중...</div>;
  if (!dashboardData) return null;

  return (
    <div className="teacher-dashboard">
      <h1>학생 활동 현황</h1>

      <div className="unit-selector">
        <select
          value={selectedUnit}
          onChange={(e) => setSelectedUnit(e.target.value)}
        >
          {units.map((unit) => (
            <option key={unit.id} value={unit.worldId}>
              {unit.unitName}
            </option>
          ))}
        </select>
      </div>

      <div className="dashboard-summary">
        <div className="summary-item">
          <h3>유닛명</h3>
          <p>{dashboardData.unitName}</p>
        </div>
        <div className="summary-item">
          <h3>전체 학생 수</h3>
          <p>{dashboardData.totalStudents}</p>
        </div>
        <div className="summary-item">
          <h3>평균 점수</h3>
          <p>{dashboardData.averageScore.toFixed(2)}</p>
        </div>
      </div>

      <div className="recent-visits">
        <h2>학생별 진행 현황</h2>
        <table>
          <thead>
            <tr>
              <th>학생 ID</th>
              <th>점수</th>
              <th>최근 방문 시간</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.recentVisits.map((visit, index) => (
              <tr key={index}>
                <td>{visit.studentId}</td>
                <td>{visit.score}</td>
                <td>{new Date(visit.visitDate).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherDashboard;
