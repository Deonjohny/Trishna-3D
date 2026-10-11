import type { Room, ViewMode } from '../types/building';
import { buildingStandards, formatLength, minimumRoomSizeFt, roomMeetsMinimum, type BuildingStandard, type StandardId, type UnitSystem } from '../data/standards';

type Props = {
  rooms: Room[]; selected: string; onSelect: (id: string) => void; onColor: (id: string, color: string) => void;
  view: ViewMode; onView: (v: ViewMode) => void; walkthrough: boolean; onWalk: () => void;
  roomName: string; onBack: () => void; onUpload: (f: File) => void;
  standardId: StandardId; onStandard: (id: StandardId) => void; standard: BuildingStandard;
  units: UnitSystem; onUnits: (units: UnitSystem) => void;
  buildProgress?: number;
  onReplayBuild?: () => void;
};

function areaLabel(room: Room, units: UnitSystem) {
  const bounds = room.bounds ?? { w: room.w, d: room.d };
  const area = bounds.w * bounds.d * (units === 'm' ? 0.092903 : 1);
  return `${area.toFixed(1)} ${units === 'ft' ? 'sq ft' : 'm²'}`;
}

export default function Editor({
  rooms, selected, onSelect, onColor, view, onView, walkthrough, onWalk,
  roomName, onBack, onUpload, standardId, onStandard, standard, units, onUnits,
  buildProgress = 1, onReplayBuild
}: Props) {
  const active = rooms.find((r) => r.id === selected);
  const modelSize = (room: Room) => { const b = room.bounds ?? { w: room.w, d: room.d }; return `${units === 'ft' ? b.w.toFixed(1) : (b.w * 0.3048).toFixed(2)} × ${units === 'ft' ? b.d.toFixed(1) : (b.d * 0.3048).toFixed(2)} ${units}`; };
  const sourceSize = (room: Room) => `${units === 'ft' ? room.w.toFixed(1) : (room.w * 0.3048).toFixed(2)} × ${units === 'ft' ? room.d.toFixed(1) : (room.d * 0.3048).toFixed(2)} ${units}`;
  const roomSize = modelSize;
  const activeBounds = active?.bounds ?? (active ? { w: active.w, d: active.d } : undefined);
  const minimum = active ? minimumRoomSizeFt(active) : undefined;
  const meetsMinimum = !!active && roomMeetsMinimum(active);
  const levels = [...new Set(rooms.map(room => room.floor))].sort((a, b) => a - b);
  const floors = levels.map(floor => {
    const floorRooms = rooms.filter(room => room.floor === floor);
    return { floor, rooms: floorRooms, below: floorRooms.filter(room => !roomMeetsMinimum(room)).length };
  });

  const groundRooms = rooms.filter(room => room.floor === 0);
  const footprint = groundRooms.length ? {
    w: Math.max(...groundRooms.map(room => (room.bounds?.x ?? 0) + (room.bounds?.w ?? room.w))) - Math.min(...groundRooms.map(room => room.bounds?.x ?? 0)),
    d: Math.max(...groundRooms.map(room => (room.bounds?.z ?? 0) + (room.bounds?.d ?? room.d))) - Math.min(...groundRooms.map(room => room.bounds?.z ?? 0))
  } : { w: 0, d: 0 };

  const totalArea = rooms.reduce((sum, room) => { const b = room.bounds ?? { w: room.w, d: room.d }; return sum + b.w * b.d; }, 0) * (units === 'm' ? 0.092903 : 1);
  const formatFeet = (feet: number) => units === 'ft' ? feet.toFixed(0) : (feet * 0.3048).toFixed(1);

  const floorLabel = (f: number) => {
    if (f === 0) return 'Ground';
    if (f === 1) return 'First';
    if (f === 2) return 'Second';
    if (f === 3) return 'Third';
    return `Level ${f}`;
  };

  const floorTitle = (f: number) => {
    if (f === 0) return 'Ground Floor';
    if (f === 1) return 'First Floor';
    if (f === 2) return 'Second Floor';
    if (f === 3) return 'Third Floor';
    return `Level ${f}`;
  };

  const viewOptions: [ViewMode, string][] = levels.length > 1 ? [
    ['all', 'All floors'],
    ...levels.map(lvl => [lvl === 0 ? 'ground' : lvl === 1 ? 'upper' : `floor-${lvl}`, floorLabel(lvl)] as [ViewMode, string]),
    ['exploded', 'Exploded']
  ] : (levels[0] === 0 || levels.length === 0)
    ? [['ground', 'Ground floor']]
    : [
        ['all', 'Full view'],
        [levels[0] === 1 ? 'upper' : `floor-${levels[0]}`, floorTitle(levels[0])]
      ];

  const activeSourceDiffers = !!active && (Math.abs((active.bounds?.w ?? active.w) - active.w) > .2 || Math.abs((active.bounds?.d ?? active.d) - active.d) > .2);
  const projectTitle = levels.length > 1
    ? (levels.length === 3 ? 'Three-Storey Concept House' : 'Two-Storey House Plan')
    : (levels[0] === 1 ? 'Second Floor Plan' : levels[0] > 1 ? `Level ${levels[0]} Plan` : 'Ground-Floor Plan');

  return <>
    <header className="editor-top">
      <button className="back" onClick={onBack}>← <span>Dashboard</span></button>
      <div className="project-title">
        <span className="brand-mark small">T</span>
        <b>{projectTitle}</b>
        <span className="saved">● Saved locally</span>
      </div>
      <label className="secondary compact">Import plan<input type="file" accept=".pdf,image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp" onChange={e => { const file = e.target.files?.[0]; if (file) onUpload(file); e.currentTarget.value = ''; }} /></label>
    </header>
    <div className="editor-body">
      <aside className="left-panel">
        <div className="panel-head"><span>PROJECT</span><button>•••</button></div>
        <h3>{projectTitle}</h3>
        <div className="metrics">
          <div><b>{levels.length}</b><small>{levels.length === 1 ? 'FLOOR' : 'FLOORS'}</small></div>
          <div><b>{totalArea.toFixed(0)}</b><small>{units === 'ft' ? 'SQ FT' : 'M²'}</small></div>
          <div><b>{formatFeet(footprint.w)} × {formatFeet(footprint.d)}</b><small>{units.toUpperCase()} FOOTPRINT</small></div>
        </div>
        <div className="floor-list">
          {floors.map(({ floor, rooms: floorRooms, below }) => (
            <div className="floor-group" key={floor}>
              <div className="floor-title">
                ⌄ <b>{floorTitle(floor)}</b>
                <small className={below ? 'floor-check has-issues' : 'floor-check'}>{below ? `${below} below min` : 'All meet default'}</small>
              </div>
              {floorRooms.map(r => {
                const meets = roomMeetsMinimum(r);
                const [minW, minD] = minimumRoomSizeFt(r);
                return (
                  <button className={'room-row ' + (selected === r.id ? 'active' : '')} key={r.id} onClick={() => onSelect(r.id)}>
                    <i style={{ background: r.color }} />
                    <span className="room-row-name">{r.name}</span>
                    <small>{roomSize(r)}</small>
                    <b className={'minimum-mark ' + (meets ? 'ok' : 'low')} title={`${meets ? 'Meets' : 'Below'} default minimum ${minW} × ${minD} ft`}>{meets ? '✓' : '!'}</b>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="side-bottom"><div className="offline-tag">◉ &nbsp;OFFLINE MODE</div><small>All processing happens in your browser.</small></div>
      </aside>

      <main className="canvas-area">
        <div className="toolbar">
          <div className="toolbar-views">
            {viewOptions.map(([v, label]) => (
              <button key={v} className={view === v ? 'chosen' : ''} onClick={() => onView(v)}>{label}</button>
            ))}
          </div>
          <div className="walk-actions">
            {onReplayBuild && (
              <button
                className="build-btn-rebuild"
                onClick={onReplayBuild}
                title="Watch bottom-to-top construction transition again"
              >
                <span>🏗️</span> Rebuild 3D
              </button>
            )}
            {walkthrough && <div className="wide-view-pill">WIDE FIRST PERSON · 88°</div>}
            <button className={'walk-button ' + (walkthrough ? 'live' : '')} onClick={onWalk}>{walkthrough ? '✓ Walking' : '▷ Step inside'}</button>
          </div>
        </div>

        {buildProgress < 0.999 && (
          <div className="build-sequence-card">
            <div className="build-card-head">
              <span className="build-stage-badge">
                <i />
                {buildProgress < 0.33
                  ? 'Stage 1: Ground Floor & Foundation'
                  : buildProgress < 0.66
                  ? 'Stage 2: First Floor & Cantilever Balconies'
                  : 'Stage 3: Second Floor & Roof Terrace'}
              </span>
              <span className="build-percent-text">{Math.round(buildProgress * 100)}%</span>
            </div>
            <div className="build-track-wrap">
              <div
                className="build-track-fill"
                style={{ width: `${Math.round(buildProgress * 100)}%` }}
              />
            </div>
            <div className="build-stages-indicators">
              <span className={buildProgress >= 0 ? 'active' : ''}>01 Ground (10×14m)</span>
              <span className={buildProgress >= 0.33 ? 'active' : ''}>02 Level 1 Villa</span>
              <span className={buildProgress >= 0.66 ? 'active' : ''}>03 Terrace & Complete</span>
            </div>
          </div>
        )}
        <div className="canvas-footer">
          <span>{formatFeet(footprint.w)} {units} <i /> {formatFeet(footprint.d)} {units}</span>
          <span>Drag to orbit · Select a room</span>
        </div>
        {walkthrough && (
          <div className="walk-hud">
            <span>◉ WALKTHROUGH</span>
            <b>{roomName}</b>
            <small>FLOOR {(rooms.find(r => r.name === roomName)?.floor ?? 0) + 1} · WASD / ARROWS MOVE · SHIFT SPRINT · DRAG TO LOOK · FOLLOW STAIRS · WIDE VIEW</small>
          </div>
        )}
      </main>

      <aside className="right-panel">
        <div className="panel-head"><span>INSPECTOR</span><button>⌕</button></div>
        <section className="standard-card">
          <span className="eyebrow">DIMENSION STANDARD</span>
          <label className="field-label">SIZE PROFILE
            <select value={standardId} onChange={e => onStandard(e.target.value as StandardId)}>
              {Object.entries(buildingStandards).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}
            </select>
          </label>
          <label className="field-label">DISPLAY UNITS
            <select value={units} onChange={e => onUnits(e.target.value as UnitSystem)}>
              <option value="ft">Feet & inches</option>
              <option value="m">Metric (metres)</option>
            </select>
          </label>
          <div className="inspector-line"><span>FLOOR TO FLOOR</span><b>{formatLength(standard.floorHeight, units)}</b></div>
          <div className="inspector-line"><span>WALL HEIGHT / THICKNESS</span><b>{formatLength(standard.wallHeight, units)} / {formatLength(standard.wallThickness, units)}</b></div>
          <div className="inspector-line"><span>DOORS · MAIN / ROOM / BATH</span><b>{formatLength(standard.mainDoorWidth, units)} · {formatLength(standard.internalDoorWidth, units)} · {formatLength(standard.bathDoorWidth, units)}</b></div>
          <div className="inspector-line"><span>DOOR HEIGHT</span><b>{formatLength(standard.doorHeight, units)}</b></div>
          <div className="inspector-line"><span>WINDOW WIDTH × HEIGHT</span><b>{formatLength(standard.windowWidth, units)} × {formatLength(standard.windowHeight, units)}</b></div>
          <div className="inspector-line"><span>WINDOW SILL / RAILING</span><b>{formatLength(standard.windowSill, units)} / {formatLength(standard.railingHeight, units)}</b></div>
          <div className="inspector-line"><span>STAIRS</span><b>{standard.stairSteps} risers · {formatLength(standard.stairTread, units)} tread</b></div>
          <small className="standard-note">Presets set model dimensions. Confirm local building requirements before construction.</small>
        </section>

        {active ? (
          <>
            <div className="room-swatch" style={{ background: active.color }}><span>{String(active.floor).padStart(2, '0')} / {active.name}</span></div>
            <span className="eyebrow">ROOM DETAILS</span>
            <h2>{active.name}</h2>
            <label className="field-label">FLOOR
              <select value={active.floor} onChange={() => {}}>
                {levels.map(lvl => <option key={lvl} value={lvl}>{floorTitle(lvl)}</option>)}
              </select>
            </label>
            <div className="field-pair">
              <label className="field-label">MODEL WIDTH <span>{roomSize(active).split(' × ')[0]} {units}</span></label>
              <label className="field-label">MODEL DEPTH <span>{roomSize(active).split(' × ')[1]}</span></label>
            </div>
            {activeSourceDiffers && <div className="inspector-line source-size"><span>PDF LABEL SIZE</span><b>{sourceSize(active)}</b></div>}
            <div className="inspector-line"><span>MODEL AREA</span><b>{areaLabel(active, units)}</b></div>
            <div className="inspector-line"><span>FLOOR FINISH</span><b>{active.material}</b></div>
            <div className="inspector-line"><span>DOORS</span><b>{active.kind === 'outdoor' ? 'D5 · 3′-0″' : 'D2 · 3′-0″'}</b></div>
            <div className="color-edit"><label htmlFor="room-color">ROOM COLOR</label><input id="room-color" type="color" value={active.color} onChange={e => onColor(active.id, e.target.value)} /></div>
            <div className="code-card">
              <b>{meetsMinimum ? '✓ &nbsp;Default room minimum met' : '△ &nbsp;Below default room minimum'}</b>
              <p>{active.kind === 'stair' ? 'Continuous stair bay core. Clear route target: 0.68 m flight width, 0.90 m landing, 1.25 m entry, and 0.92 m at upper exit and lower approach.' : `Default minimum: ${minimum?.[0]} × ${minimum?.[1]} ft. Modeled footprint: ${activeBounds?.w.toFixed(1)} × ${activeBounds?.d.toFixed(1)} ft.`}{activeSourceDiffers ? ` PDF dimension label: ${sourceSize(active)}. The model follows its estimated layout cell.` : ''} These are planning targets; local building rules may differ.</p>
            </div>
          </>
        ) : (
          <p>Select a room to inspect it.</p>
        )}
        <div className="side-bottom"><small>Selected room</small><b>{roomName || 'No room selected'}</b></div>
      </aside>
    </div>
  </>;
}
