import factoryBgImg from './assets/factory-transparent-bg2.png';
import factoryLightBgImg from './assets/factory-lightmode-bg3.png';

export function FactoryIllustration({ theme = 'dark' }) {
  const backgroundImage = theme === 'light' ? factoryLightBgImg : factoryBgImg;

  return (
    <div
      className="factory-illustration absolute bottom-0 left-0 -z-10 hidden min-[1600px]:block"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'contain',
        backgroundPosition: 'bottom center',
        height: '65%',
        width: '115%',
      }}
      role="img"
      aria-label={`${theme === 'light' ? '라이트' : '다크'} 모드 산업 공장 일러스트`}
    />
  );
}
