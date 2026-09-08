/**
 * Preset scenarios — logically consistent simulated sensor values.
 * Values are fixed to make demos reproducible.
 */

import { SensorNode, Scenario } from '../types';

export const BASE_NODES: Omit<SensorNode, 'tilt' | 'vibration' | 'displacement' | 'crack_index' | 'soil_moisture' | 'rssi' | 'snr' | 'node_health'>[] = [
  { node_id: 'NODE-01', zone: 'Zone A', latitude: 23.8103, longitude: 86.4462, timestamp: new Date().toISOString() },
  { node_id: 'NODE-02', zone: 'Zone A', latitude: 23.8115, longitude: 86.4481, timestamp: new Date().toISOString() },
  { node_id: 'NODE-03', zone: 'Zone B', latitude: 23.8090, longitude: 86.4440, timestamp: new Date().toISOString() },
  { node_id: 'NODE-04', zone: 'Zone C', latitude: 23.8078, longitude: 86.4510, timestamp: new Date().toISOString() },
  { node_id: 'NODE-05', zone: 'Zone D', latitude: 23.8125, longitude: 86.4420, timestamp: new Date().toISOString() },
  { node_id: 'NODE-06', zone: 'Zone E', latitude: 23.8060, longitude: 86.4495, timestamp: new Date().toISOString() },
];

type SensorValues = {
  tilt: number;
  vibration: number;
  displacement: number;
  crack_index: number;
  soil_moisture: number;
  rssi: number;
  snr: number;
  node_health: number;
};

const SCENARIO_VALUES: Record<Scenario, SensorValues[]> = {
  NORMAL: [
    { tilt: 0.8, vibration: 0.05, displacement: 1.2, crack_index: 5,  soil_moisture: 38, rssi: -61, snr: 12, node_health: 98 },
    { tilt: 1.1, vibration: 0.04, displacement: 0.9, crack_index: 3,  soil_moisture: 35, rssi: -63, snr: 11, node_health: 96 },
    { tilt: 0.6, vibration: 0.06, displacement: 1.4, crack_index: 7,  soil_moisture: 41, rssi: -68, snr: 9,  node_health: 94 },
    { tilt: 0.4, vibration: 0.03, displacement: 0.7, crack_index: 2,  soil_moisture: 33, rssi: -65, snr: 10, node_health: 97 },
    { tilt: 1.3, vibration: 0.07, displacement: 1.6, crack_index: 8,  soil_moisture: 44, rssi: -72, snr: 8,  node_health: 91 },
    { tilt: 0.5, vibration: 0.04, displacement: 0.8, crack_index: 4,  soil_moisture: 37, rssi: -69, snr: 9,  node_health: 93 },
  ],
  WARNING: [
    { tilt: 4.2, vibration: 0.38, displacement: 8.2,  crack_index: 42, soil_moisture: 65, rssi: -74, snr: 6,  node_health: 83 },
    { tilt: 3.9, vibration: 0.31, displacement: 6.7,  crack_index: 38, soil_moisture: 61, rssi: -76, snr: 5,  node_health: 80 },
    { tilt: 5.1, vibration: 0.45, displacement: 9.8,  crack_index: 51, soil_moisture: 68, rssi: -79, snr: 4,  node_health: 75 },
    { tilt: 2.8, vibration: 0.22, displacement: 5.1,  crack_index: 28, soil_moisture: 55, rssi: -71, snr: 7,  node_health: 88 },
    { tilt: 3.4, vibration: 0.29, displacement: 7.3,  crack_index: 35, soil_moisture: 58, rssi: -77, snr: 5,  node_health: 79 },
    { tilt: 2.1, vibration: 0.18, displacement: 4.2,  crack_index: 22, soil_moisture: 52, rssi: -73, snr: 6,  node_health: 85 },
  ],
  CRITICAL: [
    { tilt: 9.8,  vibration: 1.24, displacement: 18.7, crack_index: 84, soil_moisture: 87, rssi: -89, snr: 1,  node_health: 48 },
    { tilt: 11.2, vibration: 1.58, displacement: 21.3, crack_index: 91, soil_moisture: 89, rssi: -92, snr: 0,  node_health: 32 },
    { tilt: 8.4,  vibration: 0.97, displacement: 14.6, crack_index: 77, soil_moisture: 83, rssi: -85, snr: 2,  node_health: 61 },
    { tilt: 7.1,  vibration: 0.82, displacement: 12.1, crack_index: 69, soil_moisture: 79, rssi: -83, snr: 3,  node_health: 68 },
    { tilt: 10.5, vibration: 1.42, displacement: 19.8, crack_index: 88, soil_moisture: 91, rssi: -94, snr: -1, node_health: 24 },
    { tilt: 6.9,  vibration: 0.71, displacement: 11.4, crack_index: 63, soil_moisture: 77, rssi: -81, snr: 3,  node_health: 72 },
  ],
  MONSOON: [
    { tilt: 3.1, vibration: 0.28, displacement: 6.4,  crack_index: 29, soil_moisture: 88, rssi: -76, snr: 5,  node_health: 79 },
    { tilt: 2.8, vibration: 0.24, displacement: 5.9,  crack_index: 25, soil_moisture: 91, rssi: -79, snr: 4,  node_health: 74 },
    { tilt: 4.0, vibration: 0.33, displacement: 7.8,  crack_index: 36, soil_moisture: 85, rssi: -82, snr: 3,  node_health: 70 },
    { tilt: 2.2, vibration: 0.19, displacement: 4.8,  crack_index: 21, soil_moisture: 82, rssi: -74, snr: 6,  node_health: 84 },
    { tilt: 3.5, vibration: 0.30, displacement: 6.9,  crack_index: 33, soil_moisture: 90, rssi: -84, snr: 2,  node_health: 66 },
    { tilt: 1.9, vibration: 0.16, displacement: 3.9,  crack_index: 18, soil_moisture: 80, rssi: -77, snr: 5,  node_health: 81 },
  ],
  CUSTOM: [
    { tilt: 2.0, vibration: 0.15, displacement: 3.5,  crack_index: 20, soil_moisture: 48, rssi: -70, snr: 7,  node_health: 90 },
    { tilt: 1.8, vibration: 0.12, displacement: 2.9,  crack_index: 16, soil_moisture: 45, rssi: -72, snr: 7,  node_health: 88 },
    { tilt: 2.5, vibration: 0.19, displacement: 4.2,  crack_index: 25, soil_moisture: 51, rssi: -74, snr: 6,  node_health: 85 },
    { tilt: 1.5, vibration: 0.10, displacement: 2.3,  crack_index: 13, soil_moisture: 42, rssi: -71, snr: 8,  node_health: 92 },
    { tilt: 2.8, vibration: 0.22, displacement: 5.0,  crack_index: 28, soil_moisture: 55, rssi: -76, snr: 6,  node_health: 83 },
    { tilt: 1.3, vibration: 0.09, displacement: 1.8,  crack_index: 10, soil_moisture: 39, rssi: -69, snr: 9,  node_health: 95 },
  ],
};

export function buildNodesForScenario(scenario: Scenario): SensorNode[] {
  const values = SCENARIO_VALUES[scenario];
  return BASE_NODES.map((base, i) => ({
    ...base,
    ...values[i],
    timestamp: new Date().toISOString(),
  }));
}

/** Add gentle random drift to simulate live sensor data */
export function driftNode(node: SensorNode, scenario: Scenario): SensorNode {
  const intensity = scenario === 'CRITICAL' ? 0.08 : scenario === 'WARNING' ? 0.05 : 0.02;
  const drift = (base: number, range: number) =>
    Math.max(0, base + (Math.random() - 0.48) * range * intensity * 2);

  return {
    ...node,
    timestamp: new Date().toISOString(),
    tilt: Math.max(0, drift(node.tilt, 2)),
    vibration: Math.max(0, drift(node.vibration, 0.3)),
    displacement: Math.max(0, drift(node.displacement, 3)),
    crack_index: Math.min(100, Math.max(0, drift(node.crack_index, 5))),
    soil_moisture: Math.min(100, Math.max(0, drift(node.soil_moisture, 3))),
    rssi: Math.min(-40, Math.max(-110, drift(node.rssi, 4))),
    snr: Math.max(-5, drift(node.snr, 2)),
    node_health: Math.min(100, Math.max(0, drift(node.node_health, 3))),
  };
}
