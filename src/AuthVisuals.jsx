import factoryBgImg from './assets/factory-transparent-bg2.png';

export function FactoryIllustration() {
  return (
    <div
      className="factory-illustration absolute bottom-0 left-0 -z-10 hidden min-[1600px]:block"
      style={{
        backgroundImage: `url(${factoryBgImg})`,
        backgroundSize: 'contain',
        backgroundPosition: 'bottom center',
        height: '65%',
        width: '115%',
      }}
      role="img"
      aria-label="배경 투명화 산업 공장 일러스트"
    />
  );
}
