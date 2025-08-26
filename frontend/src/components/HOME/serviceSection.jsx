import React from 'react'; 
import NoticeSection from './noticeSection';
import main2Img from '../../assets/main2.png';
import main3Img from '../../assets/main3.png';
import { useNavigate } from 'react-router-dom';

const ServiceSection = () => {
  const navigate = useNavigate(); 

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>이런 서비스는 어떠세요?</h3>
      
      <div style={styles.contentWrapper}>
        {/* 왼쪽 카드 영역 */}
        <div style={styles.left}>
          <div style={styles.card}>
            <div style={styles.number}>01</div>
            <h4 style={styles.cardTitle}>배출 특성 진단 테스트</h4>
            <p style={styles.description}>“우리 기관의 배출 특성, 어디에 가까울까?”</p>
            <p style={styles.description}>“감축 전략 수립의 첫걸음, 특성 진단부터!”</p>
            <div style={styles.cardFooter2}>
            <button style={styles.button}
               onClick={() => navigate('/register?sub=tier')} >배출 유형 진단하기</button>
            <img src={main2Img} alt="CO2" style={styles.cardImage2} />
            </div>
          </div>
          <div style={styles.card}>
            <div style={styles.number}>02</div>
            <h4 style={styles.cardTitle}>건물 맞춤 탄소 대시보드</h4>
            <p style={styles.description}>“우리 건물, 얼마나 줄일 수 있을까요?”</p>
            <p style={styles.description}>“활동자료 기반으로 배출량 예측부터 감축 제안까지”</p>
            <div style={styles.cardFooter3}>
            <button style={styles.button}
              onClick={() => navigate('/emissions')} >대시보드 바로가기</button>
            <img src={main3Img} alt="leaf" style={styles.cardImage3} />
            </div>
          </div>
        </div>

        {/* 오른쪽 자주 찾는 서비스 및 공지사항 */}
        <div style={styles.right}>
          <NoticeSection />
          
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#ffffff',
    padding: '60px 40px',
    textAlign: 'left',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '30px',
  },
  contentWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '40px',
  },
  left: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    flex: 2,
  },
  right: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    flex: '1 1 300px',
    padding: '24px',
    borderRadius: '12px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  number: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#15803d',
    marginBottom: '10px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '12px',
  },
  description: {
    fontSize: '14px',
    color: '#333',
    marginBottom: '4px',
  },
  button: {
    marginTop: '16px',
    backgroundColor: '#14532d',
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  cardFooter2: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
  },
  cardImage2: {
    width: '160px',  
    height: 'auto',
    marginLeft: '12px',
    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
  },
  cardFooter3: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '16px',
  },
  cardImage3: {
    width: '160px',  
    height: 'auto',
    marginLeft: '12px',
    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
  },
  
};

export default ServiceSection;