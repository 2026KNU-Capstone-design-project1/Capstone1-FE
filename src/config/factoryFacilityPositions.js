// factory_large.glb의 시설 중심을 공장 바닥 영역에 투영한 PNG 상대 좌표입니다.
// PNG 또는 시설 배치가 변경되면 이 파일의 x, y(0~100)만 수정하면 됩니다.
// GLB의 위험 연결 대상 노드 중심을 PNG 전체 영역의 상대 좌표로 투영한 값입니다.
// BOUNDARY, GROUND, MARKINGS, ROADS 등 기반 레이어는 시설 마커 대상에서 제외합니다.
export const FACTORY_FACILITY_POSITIONS = Object.freeze([
  Object.freeze({ engName: 'BUILDING_01', x: 18.9, y: 20.7 }),
  Object.freeze({ engName: 'BUILDING_02', x: 35.0, y: 20.7 }),
  Object.freeze({ engName: 'BUILDING_03', x: 18.9, y: 37.9 }),
  Object.freeze({ engName: 'BUILDING_04', x: 35.0, y: 37.9 }),
  Object.freeze({ engName: 'BUILDING_05', x: 18.9, y: 72.1 }),
  Object.freeze({ engName: 'BUILDING_06', x: 35.6, y: 72.1 }),
  Object.freeze({ engName: 'CONTAINER_01', x: 63.9, y: 85.7 }),
  Object.freeze({ engName: 'CONTAINER_02', x: 73.3, y: 85.7 }),
  Object.freeze({ engName: 'CONTAINER_03', x: 82.8, y: 85.7 }),
  Object.freeze({ engName: 'FACILITY_01', x: 85.0, y: 15.0 }),
  Object.freeze({ engName: 'FACILITY_02', x: 75.0, y: 59.3 }),
  Object.freeze({ engName: 'FACILITY_03', x: 41.1, y: 59.3 }),
  Object.freeze({ engName: 'FACILITY_04', x: 28.9, y: 59.3 }),
  Object.freeze({ engName: 'SOLAR_01', x: 17.8, y: 85.0 }),
  Object.freeze({ engName: 'SOLAR_02', x: 32.2, y: 85.0 }),
  Object.freeze({ engName: 'STACK_01', x: 59.4, y: 17.1 }),
  Object.freeze({ engName: 'STACK_02', x: 69.4, y: 17.1 }),
  Object.freeze({ engName: 'TANK_01', x: 79.4, y: 37.9 }),
  Object.freeze({ engName: 'TANK_02', x: 87.8, y: 37.9 }),
  Object.freeze({ engName: 'TANK_03', x: 79.4, y: 25.0 }),
  Object.freeze({ engName: 'TANK_04', x: 87.8, y: 25.0 }),
  Object.freeze({ engName: 'WAREHOUSE_01', x: 65.0, y: 72.9 }),
  Object.freeze({ engName: 'WAREHOUSE_02', x: 81.7, y: 72.9 }),
  Object.freeze({ engName: 'WAREHOUSE_03', x: 65.0, y: 36.4 }),
]);
