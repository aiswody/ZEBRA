// 건물 등록 UI + 우측 건물 목록 + 카카오 키워드 검색 + 하단 지도
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../contexts/authContext';

/** ─────────── 설정 ─────────── */
const BUILDINGS_API = '/api/buildings';            // 백엔드 엔드포인트
const KAKAO_KEY = '6bfadcc55e6a410027178ce3208a469e'; // Kakao JavaScript 키
const MOCK_KEY = 'mockBuildings';                  // 서버 미동작 시 로컬 저장 키

/** Kakao SDK 로더 */
function loadKakaoSDK(appKey) {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      return resolve(window.kakao);
    }
    const script = document.createElement('script');
    script.src =
      `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => {
      if (!(window.kakao && window.kakao.maps)) {
        return reject(new Error('Kakao SDK loaded but maps namespace missing'));
      }
      if (typeof window.kakao.maps.load === 'function') {
        window.kakao.maps.load(() => resolve(window.kakao));
      } else {
        resolve(window.kakao);
      }
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/** 서버/로컬 공통 유틸 */
async function safeGetList() {
  try {
    const res = await fetch(BUILDINGS_API, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error('server not ready');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    const raw = localStorage.getItem(MOCK_KEY);
    return raw ? JSON.parse(raw) : [];
  }
}
async function safeAdd(name) {
  try {
    const res = await fetch(BUILDINGS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('server not ready');
    return await res.json(); // {id, name} 가정
  } catch {
    const item = { id: Date.now(), name };
    const list = await safeGetList();
    const next = [...list, item];
    localStorage.setItem(MOCK_KEY, JSON.stringify(next));
    return item;
  }
}
async function safeDelete(id) {
  try {
    const res = await fetch(`${BUILDINGS_API}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('server not ready');
  } catch {
    const list = await safeGetList();
    localStorage.setItem(MOCK_KEY, JSON.stringify(list.filter(b => String(b.id) !== String(id))));
  }
}

const Building = () => {
  const { user } = useAuth();

  // 기관명
  const [insName, setInsName] = useState('');

  // 좌측 입력: 키워드 검색 + 최종 건물명
  const [keyword, setKeyword] = useState('');
  const [suggests, setSuggests] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [buildingName, setBuildingName] = useState(''); // 실제 추가될 이름

  // 우측 목록
  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // 지도
  const mapRef = useRef(null);
  const mapObjRef = useRef(null);
  const markerRef = useRef(null);
  const placesRef = useRef(null); // kakao.maps.services.Places

  // 초기 기관명
  useEffect(() => {
    if (user?.institutionName) {
      setInsName(user.institutionName);
      return;
    }
    try {
      const cached = JSON.parse(localStorage.getItem('userData') || 'null');
      if (cached?.insName) setInsName(cached.insName);
    } catch {}
  }, [user]);

  // Kakao 준비 + 지도 초기화 + Places 준비
  useEffect(() => {
    let mounted = true;
    (async () => {
      const kakao = await loadKakaoSDK(KAKAO_KEY);
      if (!mounted) return;
      const center = new kakao.maps.LatLng(37.5665, 126.9780); // 서울시청
      const map = new kakao.maps.Map(mapRef.current, { center, level: 4 });
      mapObjRef.current = map;
      markerRef.current = new kakao.maps.Marker({ map, position: center });
      placesRef.current = new kakao.maps.services.Places();
    })().catch(console.error);
    return () => { mounted = false; };
  }, []);

  // 목록 최초 로드
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        const data = await safeGetList();
        setList(data);
        if (data.length === 0) setLoadError('건물 목록을 가져오지 못했습니다.');
      } catch {
        setLoadError('건물 목록을 가져오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // 키워드 검색 (카카오 Places)
  useEffect(() => {
    if (!placesRef.current) return;
    if (!keyword.trim()) {
      setSuggests([]);
      return;
    }
    const t = setTimeout(() => {
      setIsSearching(true);
      placesRef.current.keywordSearch(keyword, (data, status) => {
        setIsSearching(false);
        if (status !== window.kakao.maps.services.Status.OK) {
          setSuggests([]);
          return;
        }
        const mapped = data.map(p => ({
          id: p.id,
          title: p.place_name,
          address: p.road_address_name || p.address_name || '',
          x: p.x, // lng
          y: p.y, // lat
        }));
        setSuggests(mapped.slice(0, 8));
      });
    }, 250);
    return () => clearTimeout(t);
  }, [keyword]);

  // 제안 클릭 → 건물명 세팅 + 지도 이동
  const pickSuggest = (s) => {
    setBuildingName(s.title);
    setKeyword('');
    setSuggests([]);
    if (mapObjRef.current && markerRef.current && s.y && s.x) {
      const latlng = new window.kakao.maps.LatLng(Number(s.y), Number(s.x));
      mapObjRef.current.setCenter(latlng);
      markerRef.current.setPosition(latlng);
    }
  };

  // 추가하기 → POST(또는 로컬) → 우측 목록 갱신
  const handleAdd = async () => {
    const name = buildingName.trim();
    if (!name) return alert('건물명을 입력하세요.');
    if (list.some(b => b.name === name)) {
      return alert('이미 등록된 건물입니다.');
    }
    const created = await safeAdd(name);
    setList(prev => [...prev, created]);
    setBuildingName('');
  };

  // 우측 목록에서 삭제
  const handleDelete = async (id) => {
    await safeDelete(id);
    setList(prev => prev.filter(b => String(b.id) !== String(id)));
  };

  const buildingTypes = [
    '업무 시설','교육 연구 시설','문화 및 집회시설','의료 시설','수련 시설','운수 시설',
  ];
  const [selectedPurpose, setSelectedPurpose] = useState('');

  return (
    <div style={styles.pageGrid}>
      {/* 좌측 폼 */}
      <div style={styles.container}>
        <h2 style={styles.title}>건물 등록</h2>

        {/* 기관명 표시 */}
        <div style={styles.section}>
          <label>등록 기관명 (소속):</label>
          <input
            type="text"
            value={insName || ''}
            readOnly
            style={{ ...styles.input, backgroundColor:'#f3f4f6', color:'#374151',
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}
          />
        </div>

        {/* 키워드 검색 + 제안 */}
        <div style={{ ...styles.section, position:'relative' }}>
          <label>위치 검색</label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="예: 한양대 신공학관, 동국대 원흥관…"
            style={styles.input}
          />
          {isSearching && <div style={styles.hint}>검색 중…</div>}
          {suggests.length > 0 && (
            <div style={styles.dropdown}>
              {suggests.map(s => (
                <button key={s.id} style={styles.dropdownItem} onClick={() => pickSuggest(s)}>
                  <div style={{ fontWeight:600 }}>{s.title}</div>
                  {s.address && <div style={styles.addr}>{s.address}</div>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 실제 등록될 건물명 */}
        <div style={styles.section}>
          <label>건물명</label>
          <input
            type="text"
            value={buildingName}
            onChange={(e) => setBuildingName(e.target.value)}
            placeholder="예: 동국대학교 원흥관"
            style={styles.input}
          />
          <button style={styles.registerButton} onClick={handleAdd}>추가하기</button>
        </div>

        {/* 건물 용도 (옵션) */}
        <div style={styles.section}>
          <label>건물 용도:</label>
          <div style={styles.tags}>
            {buildingTypes.map((item) => (
              <button
                key={item}
                style={{ ...styles.tag, ...(selectedPurpose===item ? styles.selectedTag : {}) }}
                onClick={() => setSelectedPurpose(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 우측: 저장된 건물 목록 (삭제 가능) */}
      <aside style={styles.rightPanel} aria-label="건물 목록">
        <div style={styles.panelHeader}>
          <div style={{ fontWeight:'bold' }}>건물 목록</div>
          <small style={{ color:'#6b7280' }}>{insName ? `기관: ${insName}` : '기관명을 확인하세요'}</small>
        </div>

        <div style={styles.listBox} role="list">
          {isLoading && <div style={styles.status}>불러오는 중…</div>}
          {loadError && !isLoading && list.length === 0 && (
            <div style={styles.error}>{loadError}</div>
          )}
          {!isLoading && !loadError && list.length === 0 && (
            <div style={styles.status}>등록된 건물이 없습니다.</div>
          )}
          {list.map((b) => (
            <div key={b.id} style={styles.item} role="listitem">
              <div style={styles.itemMain}>
                <div style={styles.itemName}>{b.name}</div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(b.id)}
                style={styles.delBtn}
                aria-label={`${b.name} 삭제`}
                title="삭제"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* 하단: 지도 */}
      <div style={{ gridColumn:'1 / -1' }}>
        <h3 style={{ margin:'16px 0 8px' }}>지도</h3>
        <div
          ref={mapRef}
          style={{ width:'100%', height:360, borderRadius:8, border:'1px solid #e5e7eb',
            overflow:'hidden', background:'#f8fafc' }}
        />
      </div>
    </div>
  );
};

/** ─────────── styles ─────────── */
const styles = {
  pageGrid: { display:'grid', gridTemplateColumns:'2fr 1.2fr', gap:'16px', alignItems:'start' },
  container: { background:'#fff', padding:'24px', borderRadius:'8px', boxShadow:'0 2px 8px rgba(0,0,0,.1)' },
  title: { marginBottom:'24px', fontSize:'22px', fontWeight:'bold' },
  section: { marginBottom:'20px' },
  input: { padding:'8px 12px', fontSize:'14px', width:'100%', borderRadius:'4px', border:'1px solid #ccc', marginTop:'8px' },
  hint: { position:'absolute', right:12, top:40, fontSize:12, color:'#6b7280' },
  dropdown: {
    position:'absolute', top:68, left:0, right:0, background:'#fff', border:'1px solid #e5e7eb',
    borderRadius:10, boxShadow:'0 8px 20px rgba(0,0,0,.08)', zIndex:20, maxHeight:280, overflow:'auto'
  },
  dropdownItem: { display:'block', width:'100%', textAlign:'left', padding:'10px 12px',
    borderBottom:'1px solid #f3f4f6', background:'transparent', cursor:'pointer' },
  addr: { fontSize:12, color:'#6b7280' },

  tags: { display:'flex', flexWrap:'wrap', gap:'8px', marginTop:'8px' },
  tag: { background:'#f0f4f3', border:'1px solid #ccc', padding:'8px 12px', borderRadius:'16px', cursor:'pointer' },
  selectedTag: { background:'#14532d', color:'#fff', border:'1px solid #14532d', fontWeight:'bold' },

  registerButton: {
    marginTop:8, background:'#00512D', color:'#fff', border:'none', padding:'10px 16px',
    borderRadius:'6px', fontWeight:'bold', cursor:'pointer'
  },

  rightPanel: { background:'#fff', padding:'16px', borderRadius:'8px', boxShadow:'0 2px 8px rgba(0,0,0,.1)', position:'sticky', top:12 },
  panelHeader: { display:'flex', flexDirection:'column', gap:4, marginBottom:8 },
  listBox: { border:'1px solid #e5e7eb', borderRadius:10, maxHeight:380, overflow:'auto', padding:8, background:'#fafafa', marginBottom:10 },
  item: { display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', padding:'8px 10px',
    borderRadius:10, background:'#fff', border:'1px solid #e5e7eb', marginBottom:8 },
  itemMain: { minWidth:0 },
  itemName: { fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  delBtn: {
    width:32, height:32, borderRadius:8, border:'none', background:'#14532d', color:'#fff',
    cursor:'pointer', fontSize:16, lineHeight:'32px'
  },
  status: { padding:'12px 8px', textAlign:'center', color:'#6b7280' },
  error: { padding:'12px 8px', textAlign:'center', color:'#b91c1c' },
};

export default Building;
