
import { MOCRequest, Asset, Facility, User, MOCTask, RegulatoryStandard, UsefulLink } from '../types';

const STORAGE_KEY = 'moc_studio_data';
const ASSET_STORAGE_KEY = 'moc_studio_assets';
const FACILITY_STORAGE_KEY = 'moc_studio_facilities';
const USER_REGISTRY_KEY = 'moc_studio_users';
const STANDARDS_STORAGE_KEY = 'moc_studio_standards';
const LINKS_STORAGE_KEY = 'moc_studio_links';

const INITIAL_FACILITIES: Facility[] = [
  { id: 'F01', name: 'P-51 FPSO', type: 'FPSO', coordinates: [-22.5, -40.5], status: 'Online' },
  { id: 'F02', name: 'P-40 Fixed', type: 'Fixed', coordinates: [-23.1, -41.2], status: 'Online' },
  { id: 'F03', name: 'Macae Terminal', type: 'Onshore', coordinates: [-22.37, -41.78], status: 'Maintenance' },
];

const INITIAL_STANDARDS: RegulatoryStandard[] = [
  { id: 'S1', code: 'API RP 754', title: 'Process Safety Performance Indicators', status: 'Active', desc: 'Guidance on safety metrics for the refining and petrochemical industries.' },
  { id: 'S2', code: 'NR-13', title: 'Boilers and Pressure Vessels', status: 'Compliance', desc: 'Brazilian regulatory standard for inspection and operation of pressurized equipment.' },
  { id: 'S3', code: 'ISO 31000', title: 'Risk Management Guidelines', status: 'Active', desc: 'Generic guidelines for the design and implementation of risk management frameworks.' },
  { id: 'S4', code: 'API 521', title: 'Pressure-relieving Systems', status: 'Technical', desc: 'Sizing and selection of pressure relief devices for petrochemical plants.' },
];

const INITIAL_LINKS: UsefulLink[] = [
  { id: 'L1', label: 'Technical Dashboard', icon: 'Layout', url: '#' },
  { id: 'L2', label: 'Asset Diagnostics', icon: 'Database', url: '#' },
  { id: 'L3', label: 'Compliance Reports', icon: 'ScrollText', url: '#' },
  { id: 'L4', label: 'User Registry', icon: 'Fingerprint', url: '#' }
];

const INITIAL_MOCS: MOCRequest[] = [
  {
    id: 'MOC-2024-001',
    title: 'Subsea Manifold Pressure Sensor Upgrade',
    requester: 'Alex Thompson',
    status: 'Evaluation',
    priority: 'High',
    changeType: 'Instrumentation',
    discipline: 'Instrumentation',
    facility: 'P-51 FPSO',
    createdAt: '2024-03-10',
    impacts: { safety: true, environmental: false, operational: true, regulatory: false, emergency: false },
    description: 'Replacement of legacy PT-201 sensors with high-accuracy Emerson Rosemount units to improve reservoir monitoring precision.',
    riskScore: 16,
    auditLog: [{ timestamp: Date.now() - 86400000, user: 'Alex Thompson', action: 'Created', details: 'Initial submission' }],
    tasks: [{ id: 'T1', title: 'Verify P&ID update', assignee: 'Sarah Miller', dueDate: '2024-04-10', completed: true, status: 'Done', type: 'Pre' }],
    relatedAssetTags: ['VAL-510-SDV-01', 'SEN-510-LT-01'],
    riskAssessment: {
      probability: 4,
      severity: 4,
      score: 16,
      rationale: 'High pressure environment with potential for manifold rupture if monitoring fails.',
      assessedAt: Date.now()
    }
  },
  {
    id: 'MOC-2024-002',
    title: 'Process Flare Tip Replacement (Sonic)',
    requester: 'Sarah Miller',
    status: 'Implementation',
    priority: 'Critical',
    changeType: 'Process',
    discipline: 'Process',
    facility: 'P-40 Fixed',
    createdAt: '2024-03-15',
    impacts: { safety: true, environmental: true, operational: true, regulatory: true, emergency: false },
    description: 'Upgrade to high-efficiency sonic flare tips to reduce radiation footprint and methane slip.',
    riskScore: 22,
    auditLog: [{ timestamp: Date.now(), user: 'System', action: 'Status Update', details: 'Moved to Implementation' }],
    relatedAssetTags: ['FLARE-400-TIP-01']
  },
  {
    id: 'MOC-2024-003',
    title: 'Emergency Shutdown (ESD) Logic Modification',
    requester: 'Elena Rodriguez',
    status: 'Approved',
    priority: 'High',
    changeType: 'Instrumentation',
    discipline: 'Instrumentation',
    facility: 'P-51 FPSO',
    createdAt: '2024-04-01',
    impacts: { safety: true, environmental: false, operational: true, regulatory: true, emergency: false },
    description: 'Updating Cause & Effect matrix to include new low-pressure trip points for the HP Separator train B.',
    riskScore: 15,
    auditLog: [],
    relatedAssetTags: ['VAL-510-SDV-01']
  },
  // ADDED 20 MORE MOCS
  { id: 'MOC-2024-004', title: 'HVAC Ducting Reinforcement (Accommodations)', requester: 'Marcus Viana', status: 'Draft', priority: 'Low', changeType: 'Mechanical', discipline: 'Mechanical', facility: 'P-51 FPSO', createdAt: '2024-04-05', impacts: { safety: false, environmental: false, operational: true, regulatory: false, emergency: false }, description: 'Improving structural integrity of accommodation ventilation due to vibration.', riskScore: 4, auditLog: [] },
  { id: 'MOC-2024-005', title: 'Switchgear Busbar Insulation Upgrade', requester: 'Alex Thompson', status: 'Evaluation', priority: 'Medium', changeType: 'Electrical', discipline: 'Electrical', facility: 'Macae Terminal', createdAt: '2024-04-06', impacts: { safety: true, environmental: false, operational: true, regulatory: false, emergency: false }, description: 'Applying new thermal insulation coating to main HV busbars.', riskScore: 10, auditLog: [] },
  { id: 'MOC-2024-006', title: 'Shift Rotation Optimization Program', requester: 'Sarah Miller', status: 'Completed', priority: 'Low', changeType: 'Personnel', discipline: 'Personnel', facility: 'P-40 Fixed', createdAt: '2024-01-15', impacts: { safety: true, environmental: false, operational: true, regulatory: false, emergency: false }, description: 'Transitioning to 3-week offshore/onshore cycles for enhanced mental health.', riskScore: 2, auditLog: [] },
  { id: 'MOC-2024-007', title: 'Helideck Structural Reinforcement', requester: 'Elena Rodriguez', status: 'Implementation', priority: 'High', changeType: 'Civil', discipline: 'Civil', facility: 'P-51 FPSO', createdAt: '2024-04-10', impacts: { safety: true, environmental: false, operational: false, regulatory: true, emergency: false }, description: 'Welding stiffeners to helideck support beams for heavier aircraft compliance.', riskScore: 18, auditLog: [] },
  { id: 'MOC-2024-008', title: 'Chemical Injection Pump Redundancy', requester: 'Marcus Viana', status: 'Approved', priority: 'Medium', changeType: 'Mechanical', discipline: 'Mechanical', facility: 'Macae Terminal', createdAt: '2024-04-12', impacts: { safety: false, environmental: true, operational: true, regulatory: false, emergency: false }, description: 'Installing a third parallel pump for corrosion inhibitor injection.', riskScore: 8, auditLog: [] },
  { id: 'MOC-2024-009', title: 'Cybersecurity Patch - DCS v4.2', requester: 'Alex Thompson', status: 'Evaluation', priority: 'Critical', changeType: 'Instrumentation', discipline: 'Instrumentation', facility: 'P-51 FPSO', createdAt: '2024-04-14', impacts: { safety: true, environmental: false, operational: true, regulatory: true, emergency: false }, description: 'Critical security update to Distributed Control System against unauthorized access.', riskScore: 25, auditLog: [] },
  { id: 'MOC-2024-010', title: 'Produced Water Filter Replacement', requester: 'Sarah Miller', status: 'Draft', priority: 'Medium', changeType: 'Process', discipline: 'Process', facility: 'P-40 Fixed', createdAt: '2024-04-15', impacts: { safety: false, environmental: true, operational: true, regulatory: true, emergency: false }, description: 'Upgrade from sand filters to ceramic membrane technology.', riskScore: 12, auditLog: [] },
  { id: 'MOC-2024-011', title: 'Gas Dehydration Glycol Optimization', requester: 'Elena Rodriguez', status: 'Evaluation', priority: 'Low', changeType: 'Process', discipline: 'Process', facility: 'Macae Terminal', createdAt: '2024-04-16', impacts: { safety: false, environmental: false, operational: true, regulatory: false, emergency: false }, description: 'Tuning TEG circulation rates for better moisture removal efficiency.', riskScore: 4, auditLog: [] },
  { id: 'MOC-2024-012', title: 'Seawater Lift Pump Impeller Swap', requester: 'Marcus Viana', status: 'Implementation', priority: 'Medium', changeType: 'Mechanical', discipline: 'Mechanical', facility: 'P-51 FPSO', createdAt: '2024-04-17', impacts: { safety: false, environmental: false, operational: true, regulatory: false, emergency: false }, description: 'Replacing standard impellers with Super Duplex variants to combat cavitation.', riskScore: 9, auditLog: [] },
  { id: 'MOC-2024-013', title: 'Fire & Gas System Zone 4 Re-mapping', requester: 'Alex Thompson', status: 'Approved', priority: 'High', changeType: 'Instrumentation', discipline: 'Instrumentation', facility: 'P-40 Fixed', createdAt: '2024-04-18', impacts: { safety: true, environmental: false, operational: false, regulatory: true, emergency: false }, description: 'Updating detector logic after structural extension of Module 4.', riskScore: 20, auditLog: [] },
  { id: 'MOC-2024-014', title: 'Compressor Surge Valve Control Revision', requester: 'Sarah Miller', status: 'Evaluation', priority: 'High', changeType: 'Process', discipline: 'Process', facility: 'Macae Terminal', createdAt: '2024-04-19', impacts: { safety: true, environmental: false, operational: true, regulatory: false, emergency: false }, description: 'Implementing fast-acting anti-surge algorithms to prevent compressor trip.', riskScore: 16, auditLog: [] },
  { id: 'MOC-2024-015', title: 'Emergency Lighting Battery Upgrade', requester: 'Elena Rodriguez', status: 'Completed', priority: 'Medium', changeType: 'Electrical', discipline: 'Electrical', facility: 'P-51 FPSO', createdAt: '2024-02-10', impacts: { safety: true, environmental: false, operational: false, regulatory: true, emergency: false }, description: 'Replacing lead-acid blocks with Li-Fe batteries in all escape routes.', riskScore: 6, auditLog: [] },
  { id: 'MOC-2024-016', title: 'Crude Oil Loading Arm Hydraulic Overhaul', requester: 'Marcus Viana', status: 'Draft', priority: 'High', changeType: 'Mechanical', discipline: 'Mechanical', facility: 'Macae Terminal', createdAt: '2024-04-20', impacts: { safety: true, environmental: true, operational: true, regulatory: false, emergency: false }, description: 'Total refurbishment of hydraulic actuators and seals for Jetty 2.', riskScore: 15, auditLog: [] },
  { id: 'MOC-2024-017', title: 'Temporary Scaffolding for Module M09', requester: 'Alex Thompson', status: 'Implementation', priority: 'Low', changeType: 'Civil', discipline: 'Civil', facility: 'P-40 Fixed', createdAt: '2024-04-21', impacts: { safety: true, environmental: false, operational: false, regulatory: false, emergency: false }, description: 'Erection of major scaffolding for upcoming flare deck painting.', riskScore: 5, auditLog: [] },
  { id: 'MOC-2024-018', title: 'OIM Handover Protocol Revision', requester: 'Sarah Miller', status: 'Completed', priority: 'Medium', changeType: 'Procedure', discipline: 'Procedure', facility: 'P-51 FPSO', createdAt: '2024-03-01', impacts: { safety: true, environmental: false, operational: true, regulatory: true, emergency: false }, description: 'Standardizing digital handovers between Offshore Installation Managers.', riskScore: 8, auditLog: [] },
  { id: 'MOC-2024-019', title: 'Laboratory Re-agent Storage Ventilation', requester: 'Elena Rodriguez', status: 'Evaluation', priority: 'Low', changeType: 'Civil', discipline: 'Civil', facility: 'Macae Terminal', createdAt: '2024-04-22', impacts: { safety: true, environmental: false, operational: false, regulatory: true, emergency: false }, description: 'Installing ATEX-certified extraction fan in chemical lab storage.', riskScore: 6, auditLog: [] },
  { id: 'MOC-2024-020', title: 'Subsea Umbilical Pressure Test Procedure', requester: 'Marcus Viana', status: 'Approved', priority: 'High', changeType: 'Procedure', discipline: 'Procedure', facility: 'P-51 FPSO', createdAt: '2024-04-23', impacts: { safety: true, environmental: true, operational: true, regulatory: true, emergency: false }, description: 'New guidelines for deepwater pressure integrity verification.', riskScore: 21, auditLog: [] },
  { id: 'MOC-2024-021', title: 'Nitrogen Generator Membrane Upgrade', requester: 'Alex Thompson', status: 'Draft', priority: 'Medium', changeType: 'Process', discipline: 'Process', facility: 'P-40 Fixed', createdAt: '2024-04-24', impacts: { safety: true, environmental: false, operational: true, regulatory: false, emergency: false }, description: 'Upgrading membranes to increase N2 purity for cargo tank inerting.', riskScore: 10, auditLog: [] },
  { id: 'MOC-2024-022', title: 'Main Power Turbine Lube Oil Cooler', requester: 'Sarah Miller', status: 'Implementation', priority: 'High', changeType: 'Mechanical', discipline: 'Mechanical', facility: 'P-51 FPSO', createdAt: '2024-04-25', impacts: { safety: false, environmental: false, operational: true, regulatory: false, emergency: false }, description: 'Bypassing leak-prone shell & tube cooler with new plate heat exchanger.', riskScore: 14, auditLog: [] },
  { id: 'MOC-2024-023', title: 'ESD Valve Actuator Spring Replacement', requester: 'Elena Rodriguez', status: 'Evaluation', priority: 'Critical', changeType: 'Instrumentation', discipline: 'Instrumentation', facility: 'P-40 Fixed', createdAt: '2024-04-26', impacts: { safety: true, environmental: false, operational: false, regulatory: true, emergency: true }, description: 'Addressing "Fail-to-Close" risk due to spring fatigue in primary SDV.', riskScore: 24, auditLog: [] }
];

const INITIAL_ASSETS: Asset[] = [
  { tag: 'VAL-510-SDV-01', name: 'Main Inlet Emergency Shutdown Valve', facility: 'P-51 FPSO', type: 'Valve', category: 'Instrumentation', material: 'Duplex F51', lastMaint: '2023-12-01', parameters: { temperature: 42, pressure: 145, flow: 1200 } },
  { tag: 'PMP-510-CRD-01', name: 'Crude Export Pump Alpha', facility: 'P-51 FPSO', type: 'Pump', category: 'Rotating', material: 'Cast Steel ASTM A216', lastMaint: '2024-01-10', parameters: { temperature: 68, pressure: 95, flow: 450 } },
  { tag: 'SEP-510-HP-01', name: 'High Pressure Separator Train A', facility: 'P-51 FPSO', type: 'Vessel', category: 'Static', material: 'Carbon Steel Clad SS316', lastMaint: '2023-11-15', parameters: { temperature: 85, pressure: 75, flow: 15000 } },
  // ADDED 30 MORE ASSETS
  { tag: 'PMP-101-SEA-A', name: 'Seawater Lift Pump A', facility: 'P-51 FPSO', type: 'Pump', category: 'Rotating', material: 'Ni-Al-Bronze', lastMaint: '2024-02-15', parameters: { temperature: 18, pressure: 12, flow: 800 } },
  { tag: 'VAL-202-PCV', name: 'Gas Export Pressure Control Valve', facility: 'P-40 Fixed', type: 'Valve', category: 'Instrumentation', material: 'Stellite Faced SS316', lastMaint: '2024-01-20', parameters: { temperature: 45, pressure: 180, flow: 500000 } },
  { tag: 'VES-301-KOD', name: 'Fuel Gas Knock-out Drum', facility: 'Macae Terminal', type: 'Vessel', category: 'Static', material: 'Carbon Steel', lastMaint: '2023-10-05', parameters: { temperature: 30, pressure: 15, flow: 1200 } },
  { tag: 'MOT-404-M', name: 'Main Power Generation Motor', facility: 'P-51 FPSO', type: 'Motor', category: 'Rotating', material: 'Cast Iron', lastMaint: '2024-03-01', parameters: { temperature: 95, pressure: 0, flow: 0 } },
  { tag: 'SEN-510-LT-01', name: 'HP Separator Level Transmitter', facility: 'P-51 FPSO', type: 'Sensor', category: 'Instrumentation', material: 'Hastelloy C', lastMaint: '2024-03-10', parameters: { temperature: 82, pressure: 74, flow: 0 } },
  { tag: 'FLARE-400-TIP-01', name: 'Main Flare Sonic Tip', facility: 'P-40 Fixed', type: 'Burner', category: 'Specialty', material: 'Inconel 625', lastMaint: '2022-12-15', parameters: { temperature: 650, pressure: 2, flow: 8500 } },
  { tag: 'HE-101-OIL', name: 'Crude Oil Pre-heater', facility: 'Macae Terminal', type: 'Heat Exchanger', category: 'Static', material: 'Titanium Tubes', lastMaint: '2023-08-20', parameters: { temperature: 110, pressure: 45, flow: 1500 } },
  { tag: 'COMP-601-C1', name: 'Gas Reinjection Compressor', facility: 'P-51 FPSO', type: 'Compressor', category: 'Rotating', material: 'Forged Steel', lastMaint: '2024-03-25', parameters: { temperature: 140, pressure: 380, flow: 12000 } },
  { tag: 'SCR-202-GLY', name: 'Glycol Contactor Tower', facility: 'P-40 Fixed', type: 'Scrubber', category: 'Static', material: 'Clad CS/SS316', lastMaint: '2023-05-10', parameters: { temperature: 40, pressure: 175, flow: 2500 } },
  { tag: 'VAL-ESD-999', name: 'Riser Emergency Isolation Valve', facility: 'P-51 FPSO', type: 'Valve', category: 'Safety', material: 'Super Duplex', lastMaint: '2024-01-05', parameters: { temperature: 12, pressure: 210, flow: 0 } },
  { tag: 'DRM-LUBE-01', name: 'Main Turbine Lube Oil Reservoir', facility: 'Macae Terminal', type: 'Vessel', category: 'Static', material: 'Stainless Steel', lastMaint: '2023-12-12', parameters: { temperature: 45, pressure: 1, flow: 450 } },
  { tag: 'TURB-GEN-01', name: 'Gas Turbine Generator A', facility: 'P-51 FPSO', type: 'Turbine', category: 'Rotating', material: 'High Temp Alloy', lastMaint: '2023-11-20', parameters: { temperature: 450, pressure: 0, flow: 0 } },
  { tag: 'TANK-STORAGE-1', name: 'Diesel Storage Tank 1', facility: 'Macae Terminal', type: 'Tank', category: 'Static', material: 'Epoxy Coated CS', lastMaint: '2023-01-10', parameters: { temperature: 25, pressure: 0, flow: 0 } },
  { tag: 'HYD-PACK-01', name: 'Subsea HPU Unit', facility: 'P-51 FPSO', type: 'HPU', category: 'Rotating', material: 'SS316', lastMaint: '2024-04-02', parameters: { temperature: 40, pressure: 345, flow: 120 } },
  { tag: 'SEN-H2S-DET-01', name: 'Personnel Area H2S Detector', facility: 'P-40 Fixed', type: 'Sensor', category: 'Safety', material: 'Polycarbonate', lastMaint: '2024-04-15', parameters: { temperature: 32, pressure: 1, flow: 0 } },
  { tag: 'PMP-FIRE-01', name: 'Diesel Fire Pump Primary', facility: 'Macae Terminal', type: 'Pump', category: 'Safety', material: 'Cast Bronze', lastMaint: '2024-04-10', parameters: { temperature: 20, pressure: 14, flow: 1500 } },
  { tag: 'VAL-BYPASS-01', name: 'HP Separator Bypass Valve', facility: 'P-51 FPSO', type: 'Valve', category: 'Instrumentation', material: 'Carbon Steel', lastMaint: '2023-09-30', parameters: { temperature: 80, pressure: 75, flow: 500 } },
  { tag: 'FILT-FUEL-A', name: 'Fuel Gas Coalescer Filter', facility: 'P-40 Fixed', type: 'Filter', category: 'Static', material: 'Carbon Steel', lastMaint: '2024-03-15', parameters: { temperature: 35, pressure: 20, flow: 800 } },
  { tag: 'MOT-PMP-CRD-B', name: 'Export Pump Motor B', facility: 'P-51 FPSO', type: 'Motor', category: 'Rotating', material: 'Cast Iron', lastMaint: '2024-02-28', parameters: { temperature: 75, pressure: 0, flow: 0 } },
  { tag: 'VES-SND-KOD', name: 'Produced Water Sand Cyclone', facility: 'Macae Terminal', type: 'Vessel', category: 'Process', material: 'Ceramic Lined CS', lastMaint: '2024-03-20', parameters: { temperature: 45, pressure: 12, flow: 2200 } },
  { tag: 'VAL-XV-101', name: 'Inlet Manifold Shutdown Valve', facility: 'P-40 Fixed', type: 'Valve', category: 'Safety', material: 'SS316', lastMaint: '2024-01-15', parameters: { temperature: 40, pressure: 185, flow: 1200 } },
  { tag: 'SEN-O2-ANAL', name: 'Flue Gas Oxygen Analyzer', facility: 'Macae Terminal', type: 'Sensor', category: 'Instrumentation', material: 'Zirconia', lastMaint: '2024-04-05', parameters: { temperature: 220, pressure: 1, flow: 10 } },
  { tag: 'COMP-INST-A', name: 'Instrument Air Compressor A', facility: 'P-51 FPSO', type: 'Compressor', category: 'Rotating', material: 'Cast Steel', lastMaint: '2024-01-30', parameters: { temperature: 45, pressure: 8, flow: 450 } },
  { tag: 'HE-GLY-CLR', name: 'Glycol Regeneration Cooler', facility: 'P-40 Fixed', type: 'Heat Exchanger', category: 'Static', material: 'Al-Brass', lastMaint: '2023-11-12', parameters: { temperature: 160, pressure: 5, flow: 300 } },
  { tag: 'VAL-REL-HP-01', name: 'HP Separator Relief Valve', facility: 'P-51 FPSO', type: 'Valve', category: 'Safety', material: 'SS316', lastMaint: '2023-06-20', parameters: { temperature: 80, pressure: 95, flow: 0 } },
  { tag: 'PMP-DIRTY-W', name: 'Open Drain Pump', facility: 'Macae Terminal', type: 'Pump', category: 'Rotating', material: 'Carbon Steel', lastMaint: '2024-04-18', parameters: { temperature: 25, pressure: 4, flow: 80 } },
  { tag: 'VES-NIT-GEN', name: 'Nitrogen Buffer Tank', facility: 'P-40 Fixed', type: 'Vessel', category: 'Static', material: 'Carbon Steel', lastMaint: '2023-10-10', parameters: { temperature: 20, pressure: 10, flow: 0 } },
  { tag: 'SEN-VIB-GEN-A', name: 'Generator A Vibration Probe', facility: 'P-51 FPSO', type: 'Sensor', category: 'Instrumentation', material: 'Stainless Steel', lastMaint: '2024-03-12', parameters: { temperature: 45, pressure: 0, flow: 0 } },
  { tag: 'VAL-CHOKE-01', name: 'Production Choke Valve Wells', facility: 'P-51 FPSO', type: 'Valve', category: 'Process', material: 'Tungsten Carbide Lined', lastMaint: '2024-02-10', parameters: { temperature: 105, pressure: 310, flow: 4500 } },
  { tag: 'HE-SALT-HEATER', name: 'Water Bath Salt Heater', facility: 'Macae Terminal', type: 'Heater', category: 'Specialty', material: 'Refractory Lined', lastMaint: '2023-04-15', parameters: { temperature: 450, pressure: 2, flow: 1200 } }
];

const INITIAL_USERS: User[] = [
  { id: 'U01', name: 'Alex Thompson', email: 'alex.thompson@mocstudio.com', role: 'Engineer', status: 'Active' },
  { id: 'U02', name: 'Sarah Miller', email: 'sarah.miller@mocstudio.com', role: 'Manager', status: 'Active' },
  { id: 'U03', name: 'Chief Auditor', email: 'chief.auditor@mocstudio.com', role: 'Auditor', status: 'Active' },
  { id: 'U04', name: 'Marcus Viana', email: 'marcus.v@petro.co', role: 'Engineer', status: 'Active' },
  { id: 'U05', name: 'Elena Rodriguez', email: 'elena.r@mocstudio.com', role: 'Manager', status: 'Active' },
];

export const storageService = {
  getMOCs: async (): Promise<MOCRequest[]> => {
    await new Promise(r => setTimeout(r, 400));
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCS));
      return INITIAL_MOCS;
    }
    return JSON.parse(stored);
  },
  saveMOC: async (moc: MOCRequest) => {
    const mocs = await storageService.getMOCs();
    const updated = [...mocs.filter(m => m.id !== moc.id), moc];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },
  // Added deleteMOC to fix the error in MOCList.tsx
  deleteMOC: async (id: string) => {
    const mocs = await storageService.getMOCs();
    const updated = mocs.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },
  getAssets: async (): Promise<Asset[]> => {
    await new Promise(r => setTimeout(r, 300));
    const stored = localStorage.getItem(ASSET_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(ASSET_STORAGE_KEY, JSON.stringify(INITIAL_ASSETS));
      return INITIAL_ASSETS;
    }
    return JSON.parse(stored);
  },
  saveAsset: async (asset: Asset) => {
    const assets = await storageService.getAssets();
    const updated = [...assets.filter(a => a.tag !== asset.tag), asset];
    localStorage.setItem(ASSET_STORAGE_KEY, JSON.stringify(updated));
  },
  deleteAsset: async (tag: string) => {
    const assets = await storageService.getAssets();
    const updated = assets.filter(a => a.tag !== tag);
    localStorage.setItem(ASSET_STORAGE_KEY, JSON.stringify(updated));
  },
  getFacilities: async (): Promise<Facility[]> => {
    await new Promise(r => setTimeout(r, 300));
    const stored = localStorage.getItem(FACILITY_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(FACILITY_STORAGE_KEY, JSON.stringify(INITIAL_FACILITIES));
      return INITIAL_FACILITIES;
    }
    return JSON.parse(stored);
  },
  saveFacility: async (facility: Facility) => {
    const facilities = await storageService.getFacilities();
    const updated = [...facilities.filter(f => f.id !== facility.id), facility];
    localStorage.setItem(FACILITY_STORAGE_KEY, JSON.stringify(updated));
  },
  deleteFacility: async (id: string) => {
    const facilities = await storageService.getFacilities();
    const updated = facilities.filter(f => f.id !== id);
    localStorage.setItem(FACILITY_STORAGE_KEY, JSON.stringify(updated));
  },
  getUsers: async (): Promise<User[]> => {
    await new Promise(r => setTimeout(r, 200));
    const stored = localStorage.getItem(USER_REGISTRY_KEY);
    if (!stored) {
      localStorage.setItem(USER_REGISTRY_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(stored);
  },
  saveUser: async (user: User) => {
    const users = await storageService.getUsers();
    const updated = [...users.filter(u => u.id !== user.id), user];
    localStorage.setItem(USER_REGISTRY_KEY, JSON.stringify(updated));
  },
  getStandards: async (): Promise<RegulatoryStandard[]> => {
    await new Promise(r => setTimeout(r, 200));
    const stored = localStorage.getItem(STANDARDS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STANDARDS_STORAGE_KEY, JSON.stringify(INITIAL_STANDARDS));
      return INITIAL_STANDARDS;
    }
    return JSON.parse(stored);
  },
  saveStandard: async (standard: RegulatoryStandard) => {
    const standards = await storageService.getStandards();
    const updated = [...standards.filter(s => s.id !== standard.id), standard];
    localStorage.setItem(STANDARDS_STORAGE_KEY, JSON.stringify(updated));
  },
  deleteStandard: async (id: string) => {
    const standards = await storageService.getStandards();
    const updated = standards.filter(s => s.id !== id);
    localStorage.setItem(STANDARDS_STORAGE_KEY, JSON.stringify(updated));
  },
  getLinks: async (): Promise<UsefulLink[]> => {
    await new Promise(r => setTimeout(r, 200));
    const stored = localStorage.getItem(LINKS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(INITIAL_LINKS));
      return INITIAL_LINKS;
    }
    return JSON.parse(stored);
  },
  saveLink: async (link: UsefulLink) => {
    const links = await storageService.getLinks();
    const updated = [...links.filter(l => l.id !== link.id), link];
    localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(updated));
  },
  deleteLink: async (id: string) => {
    const links = await storageService.getLinks();
    const updated = links.filter(l => l.id !== id);
    localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(updated));
  }
};
