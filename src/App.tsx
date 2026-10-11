import { useCallback, useEffect, useMemo, useState } from 'react';
import Dashboard from './components/Dashboard';
import Editor from './components/Editor';
import BuildingViewer3D from './components/BuildingViewer3D';
import TrishnaIntro from './components/TrishnaIntro';
import './trishna-intro.css';
import { sampleRooms } from './data/sampleTwoStoryPlan';
import { sampleThreeStoreyRooms } from './data/sampleThreeStoreyPlan';
import { sampleResidenceRooms } from './data/sampleResidencePlan';
import type { Room, ViewMode } from './types/building';
import { buildingStandards, type StandardId, type UnitSystem } from './data/standards';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [standardId, setStandardId] = useState<StandardId>('indian');
  const [units, setUnits] = useState<UnitSystem>('ft');
  const standard = buildingStandards[standardId];
  const [rooms, setRooms] = useState<Room[]>(sampleResidenceRooms);
  const [selected, setSelected] = useState(sampleResidenceRooms[0].id);
  const [view, setView] = useState<ViewMode>('all');
  const [walkthrough, setWalkthrough] = useState(false);
  const [editor, setEditor] = useState(false);
  const [filename, setFilename] = useState('3-Floor Residence Drawing (10.00m × 14.00m / 33′ × 46′)');
  const [pages, setPages] = useState(1);
  const [roomName, setRoomName] = useState(sampleResidenceRooms[0].name);
  const [uploadMessage, setUploadMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [buildProgress, setBuildProgress] = useState(1);

  // Smooth construction build-up from ground to top (takes ~6-8 seconds to build properly)
  const startBuildingAnimation = useCallback(() => {
    setBuildProgress(0.01);
    const durationMs = 7000; // 7 seconds realistic slow progressive construction
    const startTime = performance.now();
    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(1, elapsed / durationMs);
      // Smooth ease-in-out curve
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setBuildProgress(eased);
      if (t >= 1) {
        clearInterval(interval);
        setBuildProgress(1);
      }
    }, 32);
  }, []);

  const onRoom = useCallback((name: string) => setRoomName(n => n === name ? n : name), []);
  const select = useCallback((id: string) => {
    setSelected(id);
    const r = rooms.find(x => x.id === id);
    if (r) setRoomName(r.name);
  }, [rooms]);

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0];
      if (file && (file.name.toLowerCase().endsWith('.pdf') || /\.(png|jpe?g|webp)$/i.test(file.name) || file.type.startsWith('image/'))) {
        load(file);
      }
    };
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  const load = async (file: File) => {
    setFilename(file.name);
    setUploadMessage('');
    setEditor(false);
    setProcessing(true);
    try {
      const isImage = /\.(png|jpe?g|webp)$/i.test(file.name) || file.type.startsWith('image/');
      const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

      if (!isImage && !isPdf) {
        throw new Error('Please upload an architectural floor plan PDF or image (PNG, JPG, WEBP).');
      }

      let parsed: { rooms: Room[]; pages: number; roomCount: number; footprint: string; stairDetected: boolean };

      if (isImage) {
        const { analyzePlanImageFile } = await import('./utils/geminiPlanAnalyzer');
        parsed = await analyzePlanImageFile(file);
      } else {
        const { parseFloorPlanPdf } = await import('./utils/parseFloorPlanPdf');
        parsed = await parseFloorPlanPdf(file);
      }

      const floorLevels = [...new Set(parsed.rooms.map(room => room.floor))].sort((a, b) => a - b);
      const floorCount = floorLevels.length;

      setPages(parsed.pages);
      setRooms(parsed.rooms);
      if (parsed.rooms.length > 0) {
        setSelected(parsed.rooms[0].id);
        setRoomName(parsed.rooms[0].name);
      }

      const defaultView: ViewMode = floorCount > 1
        ? 'all'
        : floorLevels[0] === 1
        ? 'upper'
        : floorLevels[0] > 1
        ? `floor-${floorLevels[0]}`
        : 'ground';
      setView(defaultView);
      setWalkthrough(false);

      const stairNote = floorCount > 1 && !parsed.stairDetected
        ? ' A staircase was not detected on the ground floor, so all levels are shown but the walkthrough cannot climb between them yet.'
        : '';
      const recognizedFloors = floorLevels.map(f => f === 0 ? 'Ground' : f === 1 ? 'First/Upper' : `Level ${f}`).join(', ');
      setUploadMessage(`Processed ${parsed.roomCount} rooms across ${floorCount} floor(s) [${recognizedFloors}] (${parsed.footprint}).${stairNote}`);
      setEditor(true);
      startBuildingAnimation();
    } catch (error) {
      console.error('Plan upload / parse error:', error);
      setPages(0);
      setUploadMessage(error instanceof Error ? error.message : 'Could not process this plan. Try uploading a clear plan image or PDF.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadSampleTwoStorey = () => {
    const link = document.createElement('a');
    link.href = '/example-two-storey-plan.pdf';
    link.download = 'example-ground-floor-plan-and-guide.pdf';
    link.click();
    setFilename('Ground-floor starter + upload guide');
    setPages(5);
  };

  const downloadSampleThreeStorey = () => {
    const link = document.createElement('a');
    link.href = '/three-storey-concept-plan.pdf';
    link.download = 'three-storey-house-concept-plan.pdf';
    link.click();
    setFilename('Three-Storey Concept House (36′ × 42′)');
    setPages(5);
  };

  const downloadConceptVector = () => {
    const link = document.createElement('a');
    link.href = '/three-floor-architectural-concept.pdf';
    link.download = 'three_floor_architectural_concept_vector.pdf';
    link.click();
    setFilename('Three-Floor CAD Concept (33′ × 46′)');
    setPages(3);
  };

  const downloadUploadedResidence = () => {
    const link = document.createElement('a');
    link.href = '/three-floor-residence-drawing.pdf';
    link.download = 'three_floor_residence_drawing.pdf';
    link.click();
    setFilename('Three-Floor Residence Drawing (10m × 14m / 33′ × 46′)');
    setPages(1);
  };

  const loadThreeFloorResidenceModel = () => {
    setRooms(sampleResidenceRooms);
    setSelected(sampleResidenceRooms[0].id);
    setRoomName(sampleResidenceRooms[0].name);
    setFilename('3-Floor Residence Drawing (10.00m × 14.00m / 33′ × 46′)');
    setPages(1);
    setView('all');
    setWalkthrough(false);
    setEditor(true);
    startBuildingAnimation();
  };

  const loadThreeStoreyModel = () => {
    setRooms(sampleThreeStoreyRooms);
    setSelected(sampleThreeStoreyRooms[0].id);
    setRoomName(sampleThreeStoreyRooms[0].name);
    setFilename('Three-Storey Concept House (36′ × 42′)');
    setPages(5);
    setView('all');
    setWalkthrough(false);
    setEditor(true);
    startBuildingAnimation();
  };

  const loadTwoStoreyModel = () => {
    setRooms(sampleRooms);
    setSelected(sampleRooms[0].id);
    setRoomName(sampleRooms[0].name);
    setFilename('Two-Storey Indian Home (26′ × 32′)');
    setPages(5);
    setView('all');
    setWalkthrough(false);
    setEditor(true);
    startBuildingAnimation();
  };

  const viewer = useMemo(
    () => (
      <BuildingViewer3D
        rooms={rooms}
        view={view}
        walkthrough={walkthrough}
        onSelect={select}
        onRoom={onRoom}
        standard={standard}
        buildProgress={buildProgress}
      />
    ),
    [rooms, view, walkthrough, select, onRoom, standard, buildProgress]
  );

  return (
    <div className={editor ? 'app-shell editor-shell' : 'app-shell home-shell'}>
      {showIntro && <TrishnaIntro onFinish={() => setShowIntro(false)} />}

      <header className="main-header">
        <div className="brand" onClick={() => setShowIntro(true)} style={{ cursor: 'pointer' }} title="Trishna 3D · Replay Intro">
          <span className="brand-mark">T</span>
          <span>Trishna<em> 3D</em></span>
          <small>ARCHITECTURAL STUDIO</small>
        </div>
        <div className="header-center">
          TRISHNA 3D STUDIO <i /> <b>2D PLAN → 3D MULTI-STOREY HOME</b>
        </div>
        <div className="header-right">
          <button className="trishna-replay-pill" onClick={() => setShowIntro(true)} title="Watch Trishna 3D Brick & Building Intro">
            <span>↺</span> Intro
          </button>
          <span className="offline-tag">◉ &nbsp;100% LOCAL</span>
          <button className="avatar">T</button>
        </div>
      </header>

      {editor ? (
        <>
          <Editor
            rooms={rooms}
            selected={selected}
            onSelect={select}
            onColor={(id, color) => setRooms(current => current.map(room => room.id === id ? { ...room, color } : room))}
            view={view}
            onView={setView}
            walkthrough={walkthrough}
            onWalk={() => setWalkthrough(x => !x)}
            roomName={roomName}
            onBack={() => { setEditor(false); setWalkthrough(false); }}
            onUpload={load}
            standardId={standardId}
            onStandard={setStandardId}
            standard={standard}
            units={units}
            onUnits={setUnits}
            buildProgress={buildProgress}
            onReplayBuild={startBuildingAnimation}
          />
          <div className="viewer-layer">{viewer}</div>
        </>
      ) : (
        <>
          <Dashboard
            name={filename}
            pages={pages}
            message={uploadMessage}
            processing={processing}
            onUpload={load}
            onSample={downloadSampleTwoStorey}
            onSampleThreeStorey={downloadSampleThreeStorey}
            onSampleConceptVector={downloadConceptVector}
            onSampleUploadedResidence={downloadUploadedResidence}
            onLoadThreeStorey={loadThreeStoreyModel}
            onLoadResidenceModel={loadThreeFloorResidenceModel}
            onReplayIntro={() => setShowIntro(true)}
          />
          <main className="home-lower">
            <div>
              <span className="eyebrow">YOUR PLAN, MADE WALKABLE</span>
              <h2>From 2D drawing<br />to a multi-storey 3D space.</h2>
              <p>Trishna 3D supports 1, 2, or 3+ floors with aligned central staircase cores, door clearances, room finishing, and live first-person navigation.</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
                <button className="home-explore" onClick={loadThreeFloorResidenceModel} style={{ background: '#245a50' }}>Explore 3-Floor Residence (10m × 14m) <span>↗</span></button>
                <button className="home-explore" onClick={loadThreeStoreyModel}>Explore 3-Storey Concept <span>↗</span></button>
                <button className="home-explore" onClick={loadTwoStoreyModel} style={{ background: '#3b5550' }}>Explore 2-Storey Starter <span>↗</span></button>
              </div>
            </div>
            <div className="feature-list">
              <div>
                <span>01</span>
                <b>Choose Any PDF</b>
                <small>Ground floor only or multi-storey sheets (Level 00, Level 01, Level 02).</small>
              </div>
              <div>
                <span>02</span>
                <b>We Map All Rooms</b>
                <small>Room labels, dimensions, and continuous stair cores automatically aligned.</small>
              </div>
              <div>
                <span>03</span>
                <b>Step Inside in 3D</b>
                <small>Inspect room heights, door swings, exploded floors, and climb stairs in first-person.</small>
              </div>
            </div>
          </main>
          <div className="home-preview">{viewer}</div>
        </>
      )}

      <footer>
        <span>TRISHNA 3D STUDIO <i /> MULTI-STOREY ARCHITECTURAL 3D</span>
        <span>100% PRIVATE · BROWSER NATIVE</span>
      </footer>
    </div>
  );
}
