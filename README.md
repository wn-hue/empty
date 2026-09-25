<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>동도금 PM 일일 보고 & 스케줄 플래너</title>

<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>

<style>
  :root {
    --bg-base: #f8fafc;
    --bg-card: #ffffff;
    --border: #cbd5e1;
    --border-light: #e2e8f0;
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --accent: #0284c7;
    --accent-hover: #0369a1;
    --accent-light: #e0f2fe;
    --warning: #d97706;
    --warning-light: #fef3c7;
    --danger: #dc2626;
    --danger-light: #fee2e2;
    --success: #16a34a;
    --success-light: #dcfce7;
    --purple: #7c3aed;
    --purple-light: #ede9fe;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif;
    background-color: var(--bg-base);
    color: var(--text-primary);
    padding: 16px;
    font-size: 13.5px;
    line-height: 1.5;
  }

  .container { max-width: 1440px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px; }

  /* 헤더 & 날짜 네비게이터 */
  header {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  .header-title h1 { font-size: 18px; font-weight: 800; color: var(--accent); }
  .header-title p { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }

  .date-controller {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #f1f5f9;
    padding: 4px 8px;
    border-radius: 8px;
    border: 1px solid var(--border-light);
  }
  .date-display {
    font-size: 14px;
    font-weight: 800;
    color: var(--text-primary);
    min-width: 150px;
    text-align: center;
  }

  /* 탭 네비게이션 */
  .main-nav {
    display: flex;
    gap: 6px;
    border-bottom: 2px solid var(--border);
  }
  .nav-btn {
    background: #e2e8f0;
    border: 1px solid var(--border);
    border-bottom: none;
    color: var(--text-secondary);
    padding: 9px 18px;
    font-size: 13.5px;
    font-weight: 700;
    cursor: pointer;
    border-radius: 8px 8px 0 0;
    transition: 0.15s;
  }
  .nav-btn.active {
    background: var(--bg-card);
    color: var(--accent);
    border-bottom: 2px solid var(--bg-card);
    margin-bottom: -2px;
  }

  .tab-pane { display: none; }
  .tab-pane.active { display: block; }

  /* 카드 공통 */
  .card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
  }
  .card-header {
    font-size: 14.5px;
    font-weight: 700;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-light);
    padding-bottom: 8px;
    gap: 8px;
    flex-wrap: wrap;
  }

  /* 2단 분할 레이아웃 (보고서 메인 전용) */
  .report-workspace {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
  }
  @media (min-width: 1024px) {
    .report-workspace { grid-template-columns: 1.15fr 0.85fr; }
  }

  /* 알림 배너 */
  .alert-banner {
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 12.5px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .alert-banner.warning { background: var(--warning-light); color: #92400e; border: 1px solid #fde68a; }
  .alert-banner.danger { background: var(--danger-light); color: #991b1b; border: 1px solid #fecaca; }
  .alert-banner.purple { background: var(--purple-light); color: #5b21b6; border: 1px solid #ddd6fe; }

  /* 카테고리별 PM 아이템 리스트 */
  .pm-group {
    background: #f8fafc;
    border: 1px solid var(--border-light);
    border-radius: 8px;
    padding: 10px 12px;
  }
  .pm-group-title {
    font-size: 12px;
    font-weight: 700;
    color: var(--text-secondary);
    margin-bottom: 6px;
    text-transform: uppercase;
  }
  .pm-pill-list { display: flex; flex-wrap: wrap; gap: 6px; }
  .pm-pill {
    background: #fff;
    border: 1px solid var(--border);
    padding: 4px 9px;
    border-radius: 6px;
    font-size: 12.5px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .pm-pill.highlight { border-color: var(--accent); background: var(--accent-light); color: var(--accent); }

  /* 배지 스타일 */
  .badge {
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 700;
    white-space: nowrap;
  }
  .badge-blue { background: var(--accent-light); color: var(--accent); }
  .badge-purple { background: var(--purple-light); color: var(--purple); }
  .badge-green { background: var(--success-light); color: var(--success); }
  .badge-yellow { background: var(--warning-light); color: var(--warning); }
  .badge-red { background: var(--danger-light); color: var(--danger); }
  .badge-sub { background: #e2e8f0; color: #475569; }

  /* 입력 폼 */
  input, select, textarea {
    background: #ffffff;
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 6px 9px;
    border-radius: 6px;
    font-size: 12.5px;
  }
  input:focus, select:focus, textarea:focus { outline: none; border-color: var(--accent); }

  .btn {
    background: var(--accent);
    color: #fff;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 12.5px;
    cursor: pointer;
    transition: 0.15s;
    white-space: nowrap;
  }
  .btn:hover { background: var(--accent-hover); }
  .btn-sub { background: #64748b; color: #fff; }
  .btn-sub:hover { background: #475569; }
  .btn-success { background: var(--success); color: #fff; }
  .btn-success:hover { background: #15803d; }
  .btn-sm { padding: 4px 8px; font-size: 11.5px; }

  /* 우측 보고서 텍스트 영역 */
  .report-textarea {
    width: 100%;
    height: 480px;
    background: #f8fafc;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 14px;
    font-family: Consolas, "Courier New", monospace;
    font-size: 13.5px;
    line-height: 1.65;
    color: #0f172a;
    resize: vertical;
    white-space: pre-wrap;
  }

  /* 테이블 스타일 */
  .table-responsive { width: 100%; overflow-x: auto; border: 1px solid var(--border-light); border-radius: 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; background: #fff; }
  th, td { padding: 9px 12px; border: 1px solid var(--border-light); text-align: left; }
  th { background: #f8fafc; color: var(--text-secondary); font-weight: 700; }
  .today-col { background: #f0f9ff !important; border-left: 2px solid var(--accent) !important; border-right: 2px solid var(--accent) !important; }

  .note-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #ffedd5;
    color: #9a3412;
    font-size: 11.5px;
    padding: 2px 7px;
    border-radius: 4px;
    margin: 2px;
  }
  .note-tag button { background: none; border: none; color: #9a3412; cursor: pointer; font-weight: bold; }
</style>
</head>
<body>

<div class="container">
  <!-- 상단 공통 헤더 및 날짜 컨트롤러 -->
  <header>
    <div class="header-title">
      <h1>동도금 PM 일일 보고 & 스케줄 플래너</h1>
      <p>일정 자동 판정 엔진 · 특이사항 원클릭 취합 · 일일 보고서 텍스트 생성</p>
    </div>
    
    <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
      <div class="date-controller">
        <button class="btn btn-sub btn-sm" onclick="shiftDate(-1)">◀ 전일</button>
        <span id="currentDateDisplay" class="date-display">로딩 중...</span>
        <button class="btn btn-sub btn-sm" onclick="shiftDate(1)">익일 ▶</button>
        <button class="btn btn-sm" onclick="setToday()">오늘</button>
      </div>
      <div id="syncStatus" style="font-size:12px; font-weight:700; color:#64748b;">⚪ 서버 연결 확인 중...</div>
    </div>
  </header>

  <!-- 메인 탭 -->
  <div class="main-nav">
    <button class="nav-btn active" id="tabBtnReport" onclick="switchTab('report')">📋 오늘의 PM 브리핑 & 보고 (메인)</button>
    <button class="nav-btn" id="tabBtnMatrix" onclick="switchTab('matrix')">🗓️ 주간 PM 매트릭스</button>
    <button class="nav-btn" id="tabBtnCycle" onclick="switchTab('cycle')">🧪 화학동 & 펄스 주기 관리</button>
  </div>

  <!-- [화면 1] 오늘의 PM 브리핑 & 보고 (원스톱 업무 화면) -->
  <div id="tabReport" class="tab-pane active">
    <!-- 조건부 경보 배너 영역 -->
    <div id="alertBannerContainer" style="display:flex; flex-direction:column; gap:6px; margin-bottom:12px;"></div>

    <div class="report-workspace">
      <!-- 좌측: 일정 요약 및 당일 변동사항 입력 -->
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div class="card">
          <div class="card-header">
            <span>⚙️ 기준 설정</span>
            <span style="font-size:11.5px; color:var(--text-secondary);">수정 시 보고서에 즉시 반영됩니다.</span>
          </div>
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <div style="display:flex; align-items:center; gap:6px;">
              <label style="font-weight:700;">패스 기준:</label>
              <input type="text" id="passTimeInput" value="7시패스" style="width:90px;" oninput="generateReport()">
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
              <label style="font-weight:700;">금일 에칭 PM:</label>
              <input type="text" id="etchingInput" value="에3.4" style="width:80px;" oninput="generateReport()">
            </div>
          </div>
        </div>

        <!-- 오늘 판정된 PM 요약 -->
        <div class="card">
          <div class="card-header">
            <span>🔍 자동 추출된 금일 정기 PM</span>
            <span class="badge badge-blue" id="dayOfWeekBadge">요일</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <div class="pm-group">
              <div class="pm-group-title">데버링 / 고압수세 / 에칭</div>
              <div class="pm-pill-list" id="listDebarr"></div>
            </div>
            <div class="pm-group">
              <div class="pm-group-title">디스미어 & 블랙홀</div>
              <div class="pm-pill-list" id="listDesmear"></div>
            </div>
            <div class="pm-group">
              <div class="pm-group-title">일반 화학동 (72시간 주기 도래)</div>
              <div class="pm-pill-list" id="listChem"></div>
            </div>
            <div class="pm-group">
              <div class="pm-group-title">전기동 (정기 & 펄스)</div>
              <div class="pm-pill-list" id="listElectro"></div>
            </div>
          </div>
        </div>

        <!-- 당일 라인별 특이사항 즉시 추가 -->
        <div class="card">
          <div class="card-header">
            <span>✏️ 금일 특이사항 빠른 추가</span>
            <span style="font-size:11.5px; color:var(--text-secondary);">해당 라인 옆에 자동 괄호 삽입됩니다.</span>
          </div>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <select id="quickLineSelect" style="width:130px;">
              <option value="디스미어 8">디스미어 8</option>
              <option value="디스미어 10">디스미어 10</option>
              <option value="디스미어 11">디스미어 11</option>
              <option value="디스미어 15">디스미어 15</option>
              <option value="전기동 9">전기동 9</option>
              <option value="전기동 13">전기동 13</option>
              <option value="전기동 14">전기동 14</option>
              <option value="전기동 16">전기동 16</option>
              <option value="전기동 17">전기동 17</option>
              <option value="전기동 20">전기동 20</option>
              <option value="전기동 21">전기동 21</option>
              <option value="화7">화7</option>
              <option value="화8">화8</option>
              <option value="화9">화9</option>
              <option value="화13">화13</option>
              <option value="화14">화14</option>
            </select>
            <input type="text" id="quickNoteText" placeholder="직접 입력 또는 아래 버튼 클릭" style="flex:1; min-width:160px;">
            <button class="btn" onclick="addTodayNote()">추가</button>
          </div>
          <div style="display:flex; gap:5px; flex-wrap:wrap;">
            <button class="btn btn-sub btn-sm" onclick="setQuickText('스웰러 건욕')">+ 스웰러 건욕</button>
            <button class="btn btn-sub btn-sm" onclick="setQuickText('망간 건욕')">+ 망간 건욕</button>
            <button class="btn btn-sub btn-sm" onclick="setQuickText('전체건욕')">+ 전체건욕</button>
            <button class="btn btn-sub btn-sm" onclick="setQuickText('설비작업(17시)')">+ 설비작업(17시)</button>
            <button class="btn btn-sub btn-sm" onclick="setQuickText('유산동필터')">+ 유산동필터</button>
            <button class="btn btn-sub btn-sm" onclick="setQuickText('인써트 교체')">+ 인써트 교체</button>
          </div>
          <div id="todayNotesList" style="display:flex; flex-wrap:wrap; gap:4px; margin-top:2px;"></div>
        </div>
      </div>

      <!-- 우측: 생성된 보고서 & 복사 버튼 -->
      <div class="card" style="height:fit-content;">
        <div class="card-header">
          <span>📋 최종 PM 보고문</span>
          <button class="btn btn-success" onclick="copyReport()">📋 카톡 / 보고용 복사</button>
        </div>
        <textarea id="reportOutput" class="report-textarea" spellcheck="false"></textarea>
      </div>
    </div>
  </div>

  <!-- [화면 2] 주간 PM 매트릭스 -->
  <div id="tabMatrix" class="tab-pane">
    <div class="card">
      <div class="card-header">
        <div>
          <span>🗓️ 주간 PM 종합 매트릭스 (월~일)</span>
          <span class="badge badge-blue" id="matrixWeekRange"></span>
        </div>
        <span style="font-size:12px; color:var(--text-secondary);">요일을 클릭하면 해당 날짜의 보고서로 바로 이동합니다.</span>
      </div>
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th style="width:110px;">공정</th>
              <th id="th_1" style="width:12.5%;">월</th>
              <th id="th_2" style="width:12.5%;">화</th>
              <th id="th_3" style="width:12.5%;">수</th>
              <th id="th_4" style="width:12.5%;">목</th>
              <th id="th_5" style="width:12.5%;">금</th>
              <th id="th_6" style="width:12.5%;">토</th>
              <th id="th_7" style="width:12.5%;">일</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="background:#fafafa;"><strong>데버링/고압수세</strong></td>
              <td>고압수세 1 <span id="m_tag_wash1" class="badge"></span></td>
              <td>-</td>
              <td><strong>데버링 3</strong></td>
              <td>-</td>
              <td><strong>데버링 2</strong></td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td style="background:#fafafa;"><strong>디스미어</strong></td>
              <td>
                <div>디스미어 8</div>
                <div>디스미어 11 <span id="m_tag_des11" class="badge"></span></div>
                <div>디스미어 15 <span id="m_tag_des15" class="badge"></span></div>
              </td>
              <td><div>디스미어 9</div><div>디스미어 6</div></td>
              <td><div>디스미어 12</div></td>
              <td><div>디스미어 7</div></td>
              <td><div>디스미어 10</div></td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr style="background:#f0fdf4;">
              <td><strong style="color:var(--accent);">일반 화학동</strong><br><span style="font-size:11px; color:var(--text-secondary);">(72H 주기)</span></td>
              <td id="m_chem_1">-</td>
              <td id="m_chem_2">-</td>
              <td id="m_chem_3">-</td>
              <td id="m_chem_4">-</td>
              <td id="m_chem_5">-</td>
              <td id="m_chem_6">-</td>
              <td id="m_chem_7">-</td>
            </tr>
            <tr style="background:#faf5ff;">
              <td><strong style="color:var(--purple);">블랙홀</strong></td>
              <td><span class="badge badge-purple">화12 정기PM</span></td>
              <td>-</td>
              <td><span class="badge badge-purple">화11 정기PM</span></td>
              <td>-</td>
              <td><span class="badge badge-purple">화10 정기PM</span></td>
              <td>-</td>
              <td>-</td>
            </tr>
            <tr>
              <td style="background:#fafafa;"><strong>전기동</strong></td>
              <td><div>전기동 9 (펄스)</div><div>전기동 16</div></td>
              <td><div>전기동 18</div><div>전기동 22</div></td>
              <td><div>전기동 15</div><div>전기동 20 (펄스)</div></td>
              <td><div>전기동 11</div><div>전기동 14</div><div>전기동 17</div></td>
              <td><div>전기동 12 <span id="m_tag_elec12" class="badge"></span></div><div>전기동 13</div><div>전기동 21 (펄스)</div></td>
              <td>-</td>
              <td>-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- [화면 3] 주기 설정 관리 (화학동 72H & 펄스 120일) -->
  <div id="tabCycle" class="tab-pane">
    <div style="display:grid; grid-template-columns:1fr; gap:14px;">
      <!-- 화학동 최근 완료 일시 관리 -->
      <div class="card">
        <div class="card-header">
          <span>🧪 화학동 72시간 주기 기준 설정</span>
          <button class="btn btn-sm" onclick="saveCycles()">설정 저장 및 동기화</button>
        </div>
        <div style="font-size:12px; color:var(--text-secondary);">
          최근 완료 일시를 입력해 두면 <strong>72시간 후 시점이 계산되어 당일 보고서에 자동으로 포함</strong>됩니다.
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>라인</th>
                <th>최근 완료 일시 (기준)</th>
                <th>다음 PM 예정 시점 (+72H)</th>
                <th>특이사항 / 비고</th>
              </tr>
            </thead>
            <tbody id="chemSettingTableBody"></tbody>
          </table>
        </div>
      </div>

      <!-- 펄스 120일 액퍼내기 관리 -->
      <div class="card">
        <div class="card-header">
          <span>💧 펄스라인 액퍼내기 주기 관리 (120일)</span>
          <button class="btn btn-sm" onclick="saveCycles()">설정 저장 및 동기화</button>
        </div>
        <div style="font-size:12px; color:var(--text-secondary);">
          작업일 기준 1차(+120일), 2차(+240일), 3차(+360일) 일정이 산출되며, <strong>4주(28일) 전 진입 시 상단에 리마인드가 점등</strong>됩니다.
        </div>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>라인</th>
                <th>최근 액퍼내기 작업일</th>
                <th>차기 예정일 (1차)</th>
                <th>D-Day 상태</th>
              </tr>
            </thead>
            <tbody id="pulseSettingTableBody"></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyAoX8WeDRc0lzKB1x-QB501Fd_WatuyCR0",
  authDomain: "pm1234-3069b.firebaseapp.com",
  databaseURL: "https://pm1234-3069b-default-rtdb.firebaseio.com",
  projectId: "pm1234-3069b",
  storageBucket: "pm1234-3069b.firebasestorage.app",
  messagingSenderId: "716536956170",
  appId: "1:716536956170:web:8d6f9e7fa9164f9ee626f3",
  measurementId: "G-GYQXKQR7P4"
};

let db = null;
let isFirebaseConnected = false;

const DEFAULT_CHEM = [
  { id: '화7', lastDone: '2026-09-25T00:00', note: '0시PM' },
  { id: '화8', lastDone: '2026-09-23T18:30', note: '' },
  { id: '화9', lastDone: '2026-09-24T19:30', note: '' },
  { id: '화13', lastDone: '2026-09-22T13:00', note: '13시 촉매건욕' },
  { id: '화14', lastDone: '2026-09-24T15:00', note: '' }
];

const DEFAULT_PULSE = [
  { line: '전기동 9라인 (펄스)', lastDate: '2026-09-21' },
  { line: '전기동 20라인 (펄스)', lastDate: '2026-06-29' },
  { line: '전기동 21라인 (펄스)', lastDate: '2026-07-28' },
  { line: 'MSF 전기동', lastDate: '2026-08-10' }
];

const ANCHOR_BIWEEK = {
  des11: new Date('2026-09-14T00:00:00'),
  elec12: new Date('2026-09-18T00:00:00'),
  wash1: new Date('2026-09-28T00:00:00')
};

// 통합 스토리지 키 (v26)
let chemList = JSON.parse(localStorage.getItem('chem_data_v26')) || DEFAULT_CHEM;
let pulseList = JSON.parse(localStorage.getItem('pulse_data_v26')) || DEFAULT_PULSE;
let manualNotes = JSON.parse(localStorage.getItem('manual_notes_v26')) || [];

let currentDate = new Date();

function formatDateOnly(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatTimeKr(h, m) {
  h = Number(h); m = Number(m);
  if (isNaN(m) || m === 0) return `${h}시`;
  return `${h}시 ${String(m).padStart(2,'0')}분`;
}

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.getFullYear(), date.getMonth(), diff);
}

function checkBiWeek(anchorDate, targetDate) {
  const tMon = getMonday(targetDate);
  const aMon = getMonday(anchorDate);
  const diffDays = Math.round((tMon - aMon) / 86400000);
  const diffWeeks = Math.round(diffDays / 7);
  return (Math.abs(diffWeeks) % 2 === 0);
}

// Firebase 초기화
function initFirebase() {
  const statusEl = document.getElementById('syncStatus');
  try {
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
      db = firebase.database();

      db.ref('.info/connected').on('value', snap => {
        isFirebaseConnected = (snap.val() === true);
        statusEl.innerHTML = isFirebaseConnected 
          ? `<span style="color:var(--success);">🟢 클라우드 동기화됨</span>`
          : `<span style="color:var(--warning);">🟡 로컬 모드</span>`;
      });

      db.ref('pm_system_data_v26').on('value', snap => {
        const val = snap.val();
        if (val) {
          if (val.chemList) chemList = val.chemList;
          if (val.pulseList) pulseList = val.pulseList;
          if (val.manualNotes) manualNotes = val.manualNotes;
          renderAll();
        }
      });
    }
  } catch (e) {
    statusEl.innerHTML = `<span style="color:var(--warning);">🟡 로컬 모드</span>`;
  }
}

function syncToStorage() {
  localStorage.setItem('chem_data_v26', JSON.stringify(chemList));
  localStorage.setItem('pulse_data_v26', JSON.stringify(pulseList));
  localStorage.setItem('manual_notes_v26', JSON.stringify(manualNotes));

  if (db && isFirebaseConnected) {
    db.ref('pm_system_data_v26').set({
      chemList, pulseList, manualNotes,
      lastUpdated: new Date().toISOString()
    }).catch(err => console.error("Firebase Sync Error", err));
  }
}

// 탭 전환
function switchTab(t) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

  if (t === 'report') {
    document.getElementById('tabBtnReport').classList.add('active');
    document.getElementById('tabReport').classList.add('active');
    renderReportTab();
  } else if (t === 'matrix') {
    document.getElementById('tabBtnMatrix').classList.add('active');
    document.getElementById('tabMatrix').classList.add('active');
    renderMatrixTab();
  } else if (t === 'cycle') {
    document.getElementById('tabBtnCycle').classList.add('active');
    document.getElementById('tabCycle').classList.add('active');
    renderCycleSettings();
  }
}

// 날짜 변경 함수
function shiftDate(delta) {
  currentDate.setDate(currentDate.getDate() + delta);
  renderAll();
}

function setToday() {
  currentDate = new Date();
  renderAll();
}

function selectDate(dateStr) {
  currentDate = new Date(dateStr + 'T00:00:00');
  switchTab('report');
  renderAll();
}

// 전체 렌더링
function renderAll() {
  updateDateHeader();
  renderReportTab();
  renderMatrixTab();
  renderCycleSettings();
}

function updateDateHeader() {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const y = currentDate.getFullYear();
  const m = currentDate.getMonth() + 1;
  const d = currentDate.getDate();
  const dow = days[currentDate.getDay()];
  
  document.getElementById('currentDateDisplay').innerText = `${y}년 ${m}월 ${d}일 (${dow})`;
  document.getElementById('dayOfWeekBadge').innerText = `${dow}요일 PM`;
}

// [메인 탭] 리포트 및 요약 렌더링
function renderReportTab() {
  const day = currentDate.getDay();
  const curDateStr = formatDateOnly(currentDate);

  // 1. 배너 알림 판정 (화8 빌드업 & 펄스 D-Day)
  const bannerContainer = document.getElementById('alertBannerContainer');
  bannerContainer.innerHTML = '';

  // 화8 48H 체크
  const hwa8 = chemList.find(c => c.id === '화8');
  if (hwa8) {
    const hwa8Done = new Date(hwa8.lastDone);
    const limit48h = new Date(hwa8Done.getTime() + 48 * 3600000);
    if (new Date() >= limit48h) {
      bannerContainer.innerHTML += `
        <div class="alert-banner warning">
          ⚠️ <strong>[화8 주의]</strong> 직전 작업 후 48시간이 경과하여 <strong>빌드업 금지</strong> 적용 중입니다.
        </div>
      `;
    }
  }

  // 펄스 120일 D-Day 리마인드 체크
  pulseList.forEach(p => {
    const base = new Date(p.lastDate + 'T00:00:00');
    const d1 = new Date(base.getTime() + 120 * 86400000);
    const diff = Math.ceil((d1 - new Date()) / 86400000);
    if (diff <= 28 && diff > 0) {
      bannerContainer.innerHTML += `
        <div class="alert-banner purple">
          🔔 <strong>[펄스 액퍼내기]</strong> ${p.line} 1차 예정일까지 <strong>D-${diff}</strong> 남았습니다. (${d1.getMonth()+1}/${d1.getDate()} 예정)
        </div>
      `;
    }
  });

  // 2. 오늘 날짜 특이사항 칩 표시
  const noteContainer = document.getElementById('todayNotesList');
  noteContainer.innerHTML = '';
  const todaysNotes = manualNotes.filter(n => n.date === curDateStr);
  todaysNotes.forEach(n => {
    noteContainer.innerHTML += `
      <span class="note-tag">
        <strong>${n.line}</strong>: ${n.text}
        <button onclick="deleteNote('${n.id}')">&times;</button>
      </span>
    `;
  });

  // 3. 오늘 PM 항목 자동 산출
  renderTodayPills(day, curDateStr);

  // 4. 보고서 텍스트 생성
  generateReport();
}

function renderTodayPills(day, curDateStr) {
  const debarrList = document.getElementById('listDebarr');
  const desmearList = document.getElementById('listDesmear');
  const chemListEl = document.getElementById('listChem');
  const electroList = document.getElementById('listElectro');

  debarrList.innerHTML = '';
  desmearList.innerHTML = '';
  chemListEl.innerHTML = '';
  electroList.innerHTML = '';

  const etchingVal = document.getElementById('etchingInput').value.trim();
  if (etchingVal) debarrList.innerHTML += `<span class="pm-pill highlight">${etchingVal}</span>`;

  if (day === 1 && checkBiWeek(ANCHOR_BIWEEK.wash1, currentDate)) {
    debarrList.innerHTML += `<span class="pm-pill">고압수세 1라인 <span class="badge badge-green">격주</span></span>`;
  }
  if (day === 3) debarrList.innerHTML += `<span class="pm-pill">데버링 3</span>`;
  if (day === 5) debarrList.innerHTML += `<span class="pm-pill">데버링 2</span>`;

  // 디스미어 & 블랙홀
  if (day === 1) {
    desmearList.innerHTML += `<span class="pm-pill">디스미어 8</span>`;
    if (checkBiWeek(ANCHOR_BIWEEK.des11, currentDate)) {
      desmearList.innerHTML += `<span class="pm-pill">디스미어 11 <span class="badge badge-green">격주</span></span>`;
      desmearList.innerHTML += `<span class="pm-pill">디스미어 15 <span class="badge badge-green">격주</span></span>`;
    }
    desmearList.innerHTML += `<span class="pm-pill highlight">화12 정기PM</span>`;
  } else if (day === 2) {
    desmearList.innerHTML += `<span class="pm-pill">디스미어 9</span><span class="pm-pill">디스미어 6</span>`;
  } else if (day === 3) {
    desmearList.innerHTML += `<span class="pm-pill">디스미어 12</span><span class="pm-pill highlight">화11 정기PM</span>`;
  } else if (day === 4) {
    desmearList.innerHTML += `<span class="pm-pill">디스미어 7</span>`;
  } else if (day === 5) {
    desmearList.innerHTML += `<span class="pm-pill">디스미어 10</span><span class="pm-pill highlight">화10 정기PM</span>`;
  }

  // 전기동
  if (day === 1) {
    electroList.innerHTML += `<span class="pm-pill highlight">전기동 9 (펄스)</span><span class="pm-pill">전기동 16</span>`;
  } else if (day === 2) {
    electroList.innerHTML += `<span class="pm-pill">전기동 18</span><span class="pm-pill">전기동 22</span>`;
  } else if (day === 3) {
    electroList.innerHTML += `<span class="pm-pill">전기동 15</span><span class="pm-pill highlight">전기동 20 (펄스)</span>`;
  } else if (day === 4) {
    electroList.innerHTML += `<span class="pm-pill">전기동 11</span><span class="pm-pill">전기동 14</span><span class="pm-pill">전기동 17</span>`;
  } else if (day === 5) {
    if (checkBiWeek(ANCHOR_BIWEEK.elec12, currentDate)) electroList.innerHTML += `<span class="pm-pill">전기동 12 <span class="badge badge-green">격주</span></span>`;
    electroList.innerHTML += `<span class="pm-pill">전기동 13</span><span class="pm-pill highlight">전기동 21 (펄스)</span>`;
  }

  // 화학동 (72H 계산)
  const windowStart = new Date(currentDate.getTime() + 8.5 * 3600000);
  const windowEnd = new Date(currentDate.getTime() + 32.5 * 3600000);
  let matchedChems = [];

  chemList.forEach(c => {
    const t = new Date(c.lastDone);
    const nextDue = new Date(t.getTime() + 72 * 3600000);
    if (nextDue >= windowStart && nextDue <= windowEnd) {
      matchedChems.push(`${c.id} (${formatTimeKr(nextDue.getHours(), nextDue.getMinutes())})`);
    }
  });

  if (matchedChems.length > 0) {
    matchedChems.forEach(txt => chemListEl.innerHTML += `<span class="pm-pill highlight">${txt}</span>`);
  } else {
    chemListEl.innerHTML = `<span style="font-size:12px; color:var(--text-secondary);">금일 예정된 화학동 72H PM이 없습니다.</span>`;
  }
}

// 텍스트 생성
function generateReport() {
  const m = currentDate.getMonth() + 1;
  const d = currentDate.getDate();
  const day = currentDate.getDay();
  const curDateStr = formatDateOnly(currentDate);
  const pass = document.getElementById('passTimeInput').value.trim() || '7시패스';
  const etching = document.getElementById('etchingInput').value.trim();

  const getNote = (lineKey) => {
    const found = manualNotes.filter(n => n.date === curDateStr && n.line.includes(lineKey));
    return found.length > 0 ? ` ${found.map(f => f.text).join(' ')}` : '';
  };

  let debarr = '';
  let wash = '';
  let desmear = [];
  let blackhole = '';
  let electro = [];
  let chems = [];

  if (day === 1 && checkBiWeek(ANCHOR_BIWEEK.wash1, currentDate)) {
    wash = '고압수세 1라인';
  }

  if (day === 1) {
    desmear.push(`디8 기본PM${getNote('디스미어 8')}`);
    if (checkBiWeek(ANCHOR_BIWEEK.des11, currentDate)) {
      desmear.push(`디11 기본PM${getNote('디스미어 11')}`);
      desmear.push(`디15 기본PM${getNote('디스미어 15')}`);
    }
    blackhole = `화12 정기PM${getNote('화12')}`;
    electro.push(`전9 탈지 산세 박리건욕 (${pass})${getNote('전기동 9')}`);
    electro.push(`전16 유산동 (${pass})${getNote('전기동 16')}`);
  } else if (day === 2) {
    desmear.push(`디9 기본PM${getNote('디스미어 9')}`, `디6 기본PM${getNote('디스미어 6')}`);
    electro.push(`전18 기본PM (${pass})${getNote('전기동 18')}`, `전22 기본PM (${pass})${getNote('전기동 22')}`);
  } else if (day === 3) {
    debarr = '데3';
    desmear.push(`디12 기본PM${getNote('디스미어 12')}`);
    blackhole = `화11 정기PM${getNote('화11')}`;
    electro.push(`전15 기본PM (${pass})${getNote('전기동 15')}`, `전20 기본PM (${pass})${getNote('전기동 20')}`);
  } else if (day === 4) {
    desmear.push(`디7 기본PM${getNote('디스미어 7')}`);
    electro.push(`전11 기본PM (${pass})${getNote('전기동 11')}`, `전14 유산동 (${pass})${getNote('전기동 14')}`, `전17 유산동 (${pass})${getNote('전기동 17')}`);
  } else if (day === 5) {
    debarr = '데2';
    desmear.push(`디10 기본PM${getNote('디스미어 10')}`);
    blackhole = `화10 정기PM${getNote('화10')}`;
    if (checkBiWeek(ANCHOR_BIWEEK.elec12, currentDate)) electro.push(`전12 유산동 (${pass})${getNote('전기동 12')}`);
    electro.push(`전13 탈지 산세 박리건욕 (${pass})${getNote('전기동 13')}`);
    electro.push(`전21 탈지 산세 박리건욕 (7시 30분패스)${getNote('전기동 21')}`);
  }

  // 화학동
  const windowStart = new Date(currentDate.getTime() + 8.5 * 3600000);
  const windowEnd = new Date(currentDate.getTime() + 32.5 * 3600000);
  chemList.forEach(c => {
    const t = new Date(c.lastDone);
    const nextDue = new Date(t.getTime() + 72 * 3600000);
    const manualNote = getNote(c.id);

    if (nextDue >= windowStart && nextDue <= windowEnd) {
      const timeKr = formatTimeKr(nextDue.getHours(), nextDue.getMinutes());
      const prefix = (nextDue.getDate() !== currentDate.getDate()) ? `익일(${nextDue.getDate()}일) ` : '';
      const noteText = manualNote || (c.note ? ` ${c.note}` : ' 기본PM');
      chems.push(`${c.id} ${prefix}${timeKr}${noteText}`);
    } else if (manualNote) {
      chems.push(`${c.id} ${manualNote}`);
    }
  });

  // 최종 조합
  let out = `동도금 ${m}월 ${d}일 PM일정\n\n`;
  if (debarr) out += `${debarr}\n\n`;
  if (wash) out += `${wash}\n\n`;
  if (etching) out += `${etching}\n\n`;
  if (desmear.length > 0) out += `${desmear.join('\n')}\n\n`;

  if (blackhole || chems.length > 0) {
    if (blackhole) out += `${blackhole}\n`;
    chems.forEach(ch => out += `${ch}\n`);
    out += `\n`;
  }

  if (electro.length > 0) out += `${electro.join('\n')}\n\n`;
  out += `이상입니다.`;

  document.getElementById('reportOutput').value = out;
}

// 특이사항 추가/삭제
function addTodayNote() {
  const line = document.getElementById('quickLineSelect').value;
  const text = document.getElementById('quickNoteText').value.trim();
  if (!text) return;

  manualNotes.push({
    id: Date.now().toString(),
    date: formatDateOnly(currentDate),
    line,
    text
  });

  syncToStorage();
  document.getElementById('quickNoteText').value = '';
  renderReportTab();
}

function setQuickText(val) {
  document.getElementById('quickNoteText').value = val;
}

function deleteNote(id) {
  manualNotes = manualNotes.filter(n => n.id !== id);
  syncToStorage();
  renderReportTab();
}

function copyReport() {
  const el = document.getElementById('reportOutput');
  el.select();
  navigator.clipboard.writeText(el.value).then(() => {
    alert('📋 당일 PM 보고문이 클립보드에 복사되었습니다.');
  });
}

// [매트릭스 탭]
function renderMatrixTab() {
  const targetMon = getMonday(currentDate);
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const curStr = formatDateOnly(currentDate);

  for (let i = 0; i < 7; i++) {
    const d = new Date(targetMon.getTime() + i * 86400000);
    const dStr = formatDateOnly(d);
    const th = document.getElementById(`th_${i+1}`);
    th.innerHTML = `${days[i]} <span style="font-size:11px; font-weight:normal;">(${d.getMonth()+1}/${d.getDate()})</span>`;
    th.className = (dStr === curStr) ? 'today-col' : '';
    th.style.cursor = 'pointer';
    th.onclick = () => selectDate(dStr);

    // 화학동 매칭
    const cell = document.getElementById(`m_chem_${i+1}`);
    cell.innerHTML = '';
    let matches = [];
    chemList.forEach(c => {
      const due = new Date(new Date(c.lastDone).getTime() + 72 * 3600000);
      if (formatDateOnly(due) === dStr) {
        matches.push(`<strong>${c.id}</strong> <span style="color:var(--accent);">(${formatTimeKr(due.getHours(), due.getMinutes())})</span>`);
      }
    });
    cell.innerHTML = matches.length > 0 ? matches.join('<br>') : '<span style="color:#94a3b8;">-</span>';
  }

  const endSun = new Date(targetMon.getTime() + 6 * 86400000);
  document.getElementById('matrixWeekRange').innerText = `${targetMon.getMonth()+1}/${targetMon.getDate()} ~ ${endSun.getMonth()+1}/${endSun.getDate()}`;

  setTag('m_tag_wash1', checkBiWeek(ANCHOR_BIWEEK.wash1, currentDate));
  setTag('m_tag_des11', checkBiWeek(ANCHOR_BIWEEK.des11, currentDate));
  setTag('m_tag_des15', checkBiWeek(ANCHOR_BIWEEK.des11, currentDate));
  setTag('m_tag_elec12', checkBiWeek(ANCHOR_BIWEEK.elec12, currentDate));
}

function setTag(id, isThisWeek) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerText = isThisWeek ? '금주' : '차주';
  el.className = isThisWeek ? 'badge badge-green' : 'badge badge-sub';
}

// [주기 설정 탭]
function renderCycleSettings() {
  // 화학동
  const chemBody = document.getElementById('chemSettingTableBody');
  chemBody.innerHTML = '';
  chemList.forEach((c, idx) => {
    const due = new Date(new Date(c.lastDone).getTime() + 72 * 3600000);
    chemBody.innerHTML += `
      <tr>
        <td><strong>${c.id}</strong></td>
        <td>
          <input type="datetime-local" value="${c.lastDone}" id="chem_input_${idx}" style="font-size:12px;">
        </td>
        <td><strong style="color:var(--accent);">${formatDateOnly(due)} ${formatTimeKr(due.getHours(), due.getMinutes())}</strong></td>
        <td><input type="text" value="${c.note || ''}" id="chem_note_${idx}" placeholder="비고"></td>
      </tr>
    `;
  });

  // 펄스
  const pulseBody = document.getElementById('pulseSettingTableBody');
  pulseBody.innerHTML = '';
  pulseList.forEach((p, idx) => {
    const d1 = new Date(new Date(p.lastDate + 'T00:00:00').getTime() + 120 * 86400000);
    const diff = Math.ceil((d1 - new Date()) / 86400000);
    pulseBody.innerHTML += `
      <tr>
        <td><strong>${p.line}</strong></td>
        <td><input type="date" value="${p.lastDate}" id="pulse_input_${idx}"></td>
        <td><strong>${formatDateOnly(d1)}</strong></td>
        <td><span class="badge ${diff <= 28 ? 'badge-purple' : 'badge-green'}">D-${diff}</span></td>
      </tr>
    `;
  });
}

function saveCycles() {
  chemList.forEach((c, idx) => {
    const val = document.getElementById(`chem_input_${idx}`).value;
    const note = document.getElementById(`chem_note_${idx}`).value;
    if (val) c.lastDone = val;
    c.note = note;
  });

  pulseList.forEach((p, idx) => {
    const val = document.getElementById(`pulse_input_${idx}`).value;
    if (val) p.lastDate = val;
  });

  syncToStorage();
  alert('주기 설정이 저장 및 동기화되었습니다.');
  renderAll();
}

window.onload = function() {
  initFirebase();
  renderAll();
};
</script>
</body>
</html>
