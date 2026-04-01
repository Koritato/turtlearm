// 1. 모든 요소 할당
const slider = document.getElementById('height-slider');
const currentHeightDisplay = document.getElementById('current-height');
const chairResult = document.getElementById('chair-res');
const deskResult = document.getElementById('desk-res');
const monitorResult = document.getElementById('monitor-res');

// 타이머 요소 추가
const totalRuntimeDisplay = document.getElementById('total-runtime');
const turtleRuntimeDisplay = document.getElementById('turtle-runtime');

let currentRatioType = 'balanced'; // 기본값

// 비율 선택 함수
function selectRatio(element) {
    document.querySelectorAll('.ratio-card').forEach(card => card.classList.remove('active'));
    element.classList.add('active');
    
    // 선택된 카드에 따라 타입 저장 (data-ratio 속성 대신 타입을 식별자로 사용 권장)
    const ratioText = element.querySelector('.ratio-desc').innerText;
    if (ratioText === "하체 긴 편") currentRatioType = 'leg';
    else if (ratioText === "상체 긴 편") currentRatioType = 'torso';
    else currentRatioType = 'balanced';

    updateResults(slider.value);
}

function updateResults(height) {
    // 1. 표준 기준 수치 계산
    let chair = height * 0.245;
    let desk = chair + (height * 0.135);
    let monitor = desk + 30;

    // 2. 체형 비율에 따른 미세 보정
    if (currentRatioType === 'leg') {
        chair += 2.0;    
        desk += 0.0;     
        monitor -= 0.7;  
    } else if (currentRatioType === 'torso') {
        chair -= 2.0;    
        desk += 1.5;     
        monitor += 1.5;  
    }

    // 3. 화면 업데이트
    document.getElementById('chair-res').innerText = chair.toFixed(1);
    document.getElementById('desk-res').innerText = desk.toFixed(1);
    document.getElementById('monitor-res').innerText = monitor.toFixed(1);
}

// 3. 슬라이더 배경 색상 및 스타일 업데이트 (디자인 레퍼런스 반영)
function updateSliderBackground(target) {
    const min = target.min || 150;
    const max = target.max || 200;
    const val = target.value;
    const percentage = (val - min) * 100 / (max - min);
    
    // 레퍼런스 이미지처럼 왼쪽은 네온 블루/그린 그라데이션 효과
    // CSS와 연동하여 background-size를 조절
    target.style.backgroundSize = percentage + '% 100%';
}

// 4. 타이머 로직 (실시간 모니터링)
let totalSeconds = 0;
let turtleSeconds = 0;
let isTurtleNeckDetected = false; // 파이썬 AI 모델로부터 받을 상태값 (예시)

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}

function startTimers() {
    setInterval(() => {
        // 총 실행 시간 증가
        totalSeconds++;
        totalRuntimeDisplay.innerText = formatTime(totalSeconds);

        // 거북목 상태일 때만 거북목 지속 시간 증가
        if (isTurtleNeckDetected) {
            turtleSeconds++;
            turtleRuntimeDisplay.innerText = formatTime(turtleSeconds);
        }
    }, 1000);
}

// 5. 이벤트 통합 리스너
slider.addEventListener('input', function(e) {
    const val = e.target.value;

    // 수치 텍스트 업데이트
    currentHeightDisplay.innerText = val;
    
    // 추천 계산 로직 실행
    updateResults(val);
    
    // 슬라이더 색상 업데이트
    updateSliderBackground(e.target);
});

// 6. 페이지 초기 로딩 시 실행
function init() {
    updateResults(slider.value);
    updateSliderBackground(slider);
    startTimers(); // 타이머 시작
}

init();

// (참고) 파이썬 통신 예시: 서버로부터 거북목 감지 신호를 받았을 때
// function onTurtleNeckSignal(detected) {
//     isTurtleNeckDetected = detected;
// }

function toggleSystem(status, element) {
    // 1. 모든 버튼에서 active 클래스 제거
    document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
    
    // 2. 클릭한 버튼에 active 클래스 추가 (불 켜기)
    element.classList.add('active');

    if (status === 'start') {
        console.log("모니터암 구동 시작");
        // 여기에 타이머 시작 로직 추가 가능
    } else {
        console.log("모니터암 정지 및 리셋");
        // 여기에 타이머 정지 로직 추가 가능
    }
}

// ... 기존 슬라이더 통합 자바스크립트 코드 ...

// ==========================================
// 실시간 모니터링 그래프 구현 (Chart.js)
// ==========================================

const ctx = document.getElementById('realtime-chart').getContext('2d');
const totalRunTimeDisplay = document.getElementById('total-run-time');
const monitorActiveTimeDisplay = document.getElementById('monitor-active-time');

// 데이터 저장을 위한 변수
let currentTime = 0; // X축: 총 실행 시간 (초)
let monitorActiveTime = 0; // Y축: 모니터암 작동 시간 (초)
const MAX_DATA_POINTS = 30; // 그래프에 표시할 최대 데이터 포인트 개수

// Chart.js 라인 그래프 설정
const realtimeChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], // X축 레이블 (시간)
        datasets: [{
            label: 'Monitor Arm Active Time (s)',
            data: [], // Y축 데이터 (작동 시간)
            borderColor: '#5ae3a3', // 선 색상 (네온 그린)
            backgroundColor: 'rgba(90, 227, 163, 0.1)', // 선 아래 채우기 색상
            borderWidth: 2,
            pointRadius: 0, // 포인트 점 숨기기 (깔끔하게)
            tension: 0.4, // 곡선 부드럽기
            fill: true // 선 아래 채우기 활성화
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false, // 컨테이너 크기에 맞춤
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Total Run Time (s)',
                    color: '#888'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)' // 희미한 그리드 선
                },
                ticks: {
                    color: '#555'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Active Time (s)',
                    color: '#888'
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                    color: '#555'
                },
                beginAtZero: true // Y축 0부터 시작
            }
        },
        plugins: {
            legend: {
                display: false // 범례 숨기기 (상단 h2가 대체)
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: '#1b212c',
                titleColor: '#fff',
                bodyColor: '#5ae3a3',
                borderColor: '#2d3644',
                borderWidth: 1
            }
        }
    }
});

// 실시간 데이터 업데이트 시뮬레이션 함수 (1초마다 실행)
function simulateRealtimeData() {
    currentTime++; // 총 실행 시간 1초 증가

    // 모니터암 작동 시간 시뮬레이션 (거북목+누운자세시간)
    // 실제 환경에서는 백엔드나 센서에서 데이터를 받아와야 합니다.
    // 여기서는 임의로 작동하거나 작동하지 않는 상황을 가정합니다.
    const isTurtleNeck = Math.random() > 0.7; // 30% 확률로 거북목 상태
    const isLeaningBack = Math.random() > 0.8; // 20% 확률로 뒤로 누운 상태

    if (isTurtleNeck || isLeaningBack) {
        monitorActiveTime += 1; // 작동 시간 1초 증가
    }

    // 그래프 데이터 업데이트
    realtimeChart.data.labels.push(currentTime); // X축 라벨 추가
    realtimeChart.data.datasets[0].data.push(monitorActiveTime); // Y축 데이터 추가

    // 최대 데이터 포인트 개수를 넘으면 가장 오래된 데이터 제거 (스크롤 효과)
    if (realtimeChart.data.labels.length > MAX_DATA_POINTS) {
        realtimeChart.data.labels.shift();
        realtimeChart.data.datasets[0].data.shift();
    }

    // 그래프 다시 그리기
    realtimeChart.update('none'); // 애니메이션 없이 업데이트 (성능)

    // 하단 요약 텍스트 업데이트
    totalRunTimeDisplay.innerText = currentTime;
    monitorActiveTimeDisplay.innerText = monitorActiveTime;
}

// 1초(1000ms)마다 데이터 업데이트 함수 호출
setInterval(simulateRealtimeData, 1000);