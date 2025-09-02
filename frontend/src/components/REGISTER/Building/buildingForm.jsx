// 건물 등록 UI + 우측 건물 목록 + 카카오 키워드 검색 + 하단 지도
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../contexts/authContext';
import { api } from '../../../api/client';
import logoDeungrok from '../../../assets/logo_deungrok.png';
import logoPlus from '../../../assets/logo_plus.png';

/** ─────────── 설정 ─────────── */
const BUILDINGS_API = '/buildings/';
const KAKAO_KEY = '6bfadcc55e6a410027178ce3208a469e';
const MOCK_KEY = 'mockBuildings';

function loadKakaoSDK(appKey) {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      return resolve(window.kakao);
    }
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
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

async function safeGetList() {
  try {
    const { data } = await api.get(BUILDINGS_API);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  } catch (e) {
    const raw = localStorage.getItem(MOCK_KEY);
    return raw ? JSON.parse(raw) : [];
  }
}

const usageLabelMap = {
  OFFICE: '업무 시설',
  EDU_RESEARCH: '교육 연구 시설',
  CULTURE_ASSEMBLY: '문화 및 집회시설',
  MEDICAL: '의료 시설',
  TRAINING: '수련 시설',
  TRANSPORT: '운수 시설',
};

async function safeAdd(payload) {
  try {
    const { data } = await api.post(BUILDINGS_API, payload);
    return data;
  } catch (e) {
    const item = {
      id: Date.now(),
      name: payload.name,
      usage: payload.use_type || 'OTHER',
      usageLabel: usageLabelMap[payload.use_type] || '기타',
      address: payload.address || '',
    };
    const list = await safeGetList();
    const next = [...list, item];
    localStorage.setItem(MOCK_KEY, JSON.stringify(next));
    return item;
  }
}

async function deleteOnServer(id) {
  const res = await api.delete(`${BUILDINGS_API}${id}/`);
  if (![204, 200].includes(res.status)) {
    throw new Error(`DELETE failed: ${res.status}`);
  }
}

const usageMap = {
  '업무 시설': 'OFFICE',
  '교육 연구 시설': 'EDU_RESEARCH',
  '문화 및 집회시설': 'CULTURE_ASSEMBLY',
  '의료 시설': 'MEDICAL',
  '수련 시설': 'TRAINING',
  '운수 시설': 'TRANSPORT',
};

const Building = () => {
  const { user } = useAuth();
  const [insName, setInsName] = useState('');
  const [keyword, setKeyword] = useState('');
  const [suggests, setSuggests] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [buildingName, setBuildingName] = useState('');
  const [picked, setPicked] = useState(null);
  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const mapRef = useRef(null);
  const mapObjRef = useRef(null);
  const markerRef = useRef(null);
  const placesRef = useRef(null);

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

  useEffect(() => {
    let mounted = true;
    (async () => {
      const kakao = await loadKakaoSDK(KAKAO_KEY);
      if (!mounted) return;
      const center = new kakao.maps.LatLng(37.5665, 126.9780);
      const map = new kakao.maps.Map(mapRef.current, { center, level: 4 });
      mapObjRef.current = map;
      markerRef.current = new kakao.maps.Marker({ map, position: center });
      placesRef.current = new kakao.maps.services.Places();
    })().catch(console.error);
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        const data = await safeGetList();
        setList(data);
      } catch {
        setLoadError('건물 목록을 가져오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

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
          x: p.x,
          y: p.y,
        }));
        setSuggests(mapped.slice(0, 8));
      });
    }, 250);
    return () => clearTimeout(t);
  }, [keyword]);

  const pickSuggest = (s) => {
    setBuildingName(s.title);
    setKeyword('');
    setSuggests([]);
    setPicked(s);
    if (mapObjRef.current && markerRef.current && s.y && s.x) {
      const latlng = new window.kakao.maps.LatLng(Number(s.y), Number(s.x));
      mapObjRef.current.setCenter(latlng);
      markerRef.current.setPosition(latlng);
    }
  };

  const buildingTypes = [
    '업무 시설','교육 연구 시설','문화 및 집회시설','의료 시설','수련 시설','운수 시설',
  ];
  const [selectedPurpose, setSelectedPurpose] = useState('');

  const handleAdd = async () => {
    const name = buildingName.trim();
    if (!name) return alert('건물명을 입력하세요.');
    if (list.some(b => b.name === name)) {
      return alert('이미 등록된 건물입니다.');
    }
    const payload = {
      name,
      ...(selectedPurpose && { use_type: usageMap[selectedPurpose] || 'OTHER' }),
      ...(picked?.address && { address: picked.address }),
      ...(picked?.y && { lat: Number(picked.y) }),
      ...(picked?.x && { lng: Number(picked.x) }),
      ...(picked?.id && { place_id: String(picked.id) }),
      provider: 'KAKAO',
    };
    try {
      const created = await safeAdd(payload);
      setList(prev => [...prev, created]);
      setBuildingName('');
      setPicked(null);
      setSelectedPurpose('');
    } catch (e) {
      console.error(e);
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제할까요?")) return;
    try {
      await deleteOnServer(id);
      const data = await safeGetList();
      setList(data);
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했습니다.");
    }
  };

  return (
    <div style={styles.pageGrid}>
      {/* 좌측 폼 */}
      <div style={styles.container}>
        {/* 아이콘 + 텍스트 제목 */}
        <div style={styles.titleRow}>
          <img
            src={logoDeungrok}
            alt=""
            style={styles.titleIcon}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <h2 style={styles.titleText}>건물 등록</h2>
        </div>

        {/* 기관명 표시 */}
        <div style={styles.section}>
          <label> 등록명 (소속) : </label>
          <input
            type="text"
            value={insName || ''}
            readOnly
            style={{
              border: "none", outline: "none", background: "transparent",
              color:'#374151', fontSize: 16, fontWeight: 600,
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
            }}
          />
          {/* ── 구분선 ── */}
          <div style={{ ...styles.divider, marginTop: '30px' }} aria-hidden="true" />
        </div>

        {/* ↓↓↓ 등록명 이후 전체 묶음을 아래로 내림 ↓↓↓ */}
        <div style={{ marginTop: '35px' }}>
          {/* 키워드 검색 + 제안 */}
          <div style={{ ...styles.section, position:'relative' }}>
            <label>지도 위치 검색</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="예 : 한양대학교 신공학관, 동국대학교 원흥관…"
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
              placeholder="예 : 동국대학교 원흥관"
              style={styles.input}
            />
          </div>

          {/* 건물 용도 */}
          <div style={styles.section}>
            <label>건물 용도</label>
            <div style={styles.tags}>
              {buildingTypes.map((item) => (
                <button
                  key={item}
                  style={{ ...styles.tag, ...(selectedPurpose===item ? styles.selectedTag : {}) }}
                  onClick={() => setSelectedPurpose(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
            <button style={styles.registerButton} onClick={handleAdd} type="button">추가하기</button>
          </div>
        </div>
        {/* ↑↑↑ 여기까지 한 묶음 ↓↓↓ */}
      </div>

      {/* 우측: 건물 목록 */}
      <aside style={styles.rightPanel} aria-label="건물 목록">
        <div style={styles.panelHeader}>
  <div style={{ display:'flex', alignItems:'center', gap:8, fontWeight:'bold', fontSize:'22px', marginBottom:'10px' }}>
    <img
      src={logoPlus}
      alt=""
      style={{ width:22, height:22, objectFit:'contain' }}
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
    <span>건물 목록</span>
  </div>
  <small style={{
    color: '#6b7280',
    display: 'block',
    marginBottom: '25px',
    fontSize: '16px',
    fontWeight: 600
  }}>
    {insName ? `${insName}` : '기관명을 확인하세요'}
  </small>
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
                <div style={{ fontSize:12, color:'#6b7280' }}>
                  {b.usageLabel ? `용도: ${b.usageLabel}` : null}
                  {b.address ? ` · 주소: ${b.address}` : null}
                </div>
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

      {/* 하단 지도 */}
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
  pageGrid: { display:'grid', gridTemplateColumns:'2fr 1.2fr', gap:'16px', alignItems:'start', marginTop:'32px' },
  container: { background:'#fff', padding:'24px', borderRadius:'8px', boxShadow:'0 2px 8px rgba(0,0,0,.1)' },

  // 아이콘 + 텍스트 제목(건물 등록)
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: '24px',
    minHeight: 28
  },
  titleIcon: {
    width: 28,
    height: 28,
    objectFit: 'contain',
    display: 'block'
  },
  titleText: {
    fontSize: '22px',
    fontWeight: 'bold',
    margin: 0,
    lineHeight: '28px',
    color: '#111827'
  },

  // (기존 title은 미사용이지만 남겨둠 — 필요 없으면 제거 가능)
  title: { marginBottom:'24px', fontSize:'22px', fontWeight:'bold' },

  section: { marginBottom:'20px' },
  input: { padding:'8px 12px', fontSize:'14px', width:'100%', maxWidth:'95%', borderRadius:'4px', border:'1px solid #ccc', marginTop:'8px' },
  divider: { height:1, background:'#e5e7eb', margin:'20px 0' },
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
  selectedTag: { background:'#14532d', opacity: "85%", color:'#fff', border:'1px solid #14532d', fontWeight:'bold' },

registerButton: {
  marginTop: 70,
  height: 50,
  minWidth: 200,
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(180deg, #068729 0%, #068729 100%)",
  color: "#fff",
  fontSize: 16,
  fontWeight: 500,
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(34,197,94,0.18)",
},

  // 오른쪽 카드 왼쪽 여백 넉넉히
  rightPanel: {
    background:'#fff',
    padding:'24px', // top, right, bottom, left
    borderRadius:'8px',
    boxShadow:'0 2px 8px rgba(0,0,0,.1)'
  },
  panelHeader: { display:'flex', flexDirection:'column', gap:12, marginBottom:8 },
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
