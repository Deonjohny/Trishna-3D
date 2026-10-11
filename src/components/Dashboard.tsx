import { useState } from 'react';
import { TrishnaMiniBuilding } from './TrishnaIntro';

type Props = {
  name: string;
  pages: number;
  message: string;
  processing: boolean;
  onUpload: (file: File) => void;
  onSample: () => void;
  onSampleThreeStorey?: () => void;
  onSampleConceptVector?: () => void;
  onSampleUploadedResidence?: () => void;
  onLoadThreeStorey?: () => void;
  onLoadResidenceModel?: () => void;
  onReplayIntro?: () => void;
};

export default function Dashboard({
  name,
  pages,
  message,
  processing,
  onUpload,
  onSample,
  onSampleThreeStorey,
  onSampleConceptVector,
  onSampleUploadedResidence,
  onLoadThreeStorey,
  onLoadResidenceModel,
  onReplayIntro,
}: Props) {
  const [dragging, setDragging] = useState(false);

  return <>
    <section
      className={'welcome upload-welcome ' + (dragging ? 'is-dragging' : '')}
      onDragOver={event => { event.preventDefault(); setDragging(true); }}
      onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }}
      onDrop={event => { event.preventDefault(); setDragging(false); const file = event.dataTransfer.files[0]; if (file) onUpload(file); }}
    >
      <div className="welcome-copy">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <span className="hero-pill" style={{ margin: 0 }}><i>✦</i> TRISHNA 3D STUDIO</span>
          {onReplayIntro && (
            <button className="trishna-replay-pill" onClick={onReplayIntro} title="Watch Trishna 3D Brick & Building Intro">
              <span>↺</span> Replay Intro
            </button>
          )}
        </div>
        <span className="eyebrow">MULTI-STOREY ARCHITECTURAL PLANS IN 3D</span>
        <h1>Bring your home<br />plan to <em>life.</em></h1>
        <p>Upload any 1, 2, or 3-storey floor plan (PDF, PNG, JPG). Trishna 3D reconstructs real 3D rooms, continuous stairs, doors, and walkable walkthroughs.</p>
        <div className="welcome-actions">
          <label className="primary upload-primary">
            {processing ? 'Analyzing plan with Gemini AI…' : 'Upload floor plan (PDF / Image)'} <span>↑</span>
            <input type="file" accept=".pdf,image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp" disabled={processing} onChange={event => { const file = event.target.files?.[0]; if (file) onUpload(file); event.currentTarget.value = ''; }} />
          </label>
          {onSampleUploadedResidence && (
            <button className="secondary" onClick={onSampleUploadedResidence} title="Download 3-Floor Residence Drawing (10m × 14m / 33′ × 46′)">
              3-Floor Residence PDF <span>↓</span>
            </button>
          )}
          {onSampleConceptVector && (
            <button className="secondary" onClick={onSampleConceptVector} title="Download 3-Floor Architectural Concept Vector PDF">
              3-Floor CAD Concept PDF <span>↓</span>
            </button>
          )}
          {onSampleThreeStorey && (
            <button className="secondary" onClick={onSampleThreeStorey} title="Download 3-Storey Concept House PDF (36' × 42')">
              3-Storey Concept PDF <span>↓</span>
            </button>
          )}
          <button className="secondary" onClick={onSample} title="Download 2-Storey starter PDF (26' × 32')">
            2-Storey Starter PDF <span>↓</span>
          </button>
        </div>
        <div className="file-status">
          <span className="green-dot" /> {processing ? 'Recognizing rooms and floor levels with Gemini AI…' : name} <span>·</span> {pages ? `${pages} page(s)` : 'PDF or Image · Gemini Vision AI + Vector CAD'}
        </div>
        <div className="privacy-note"><span>✦</span> Powered by Gemini Vision AI · Fast 3D floor plan reconstruction</div>
        <div className="plan-cues">
          <span>GROUND TO MULTI-STOREY</span><i />
          <span>CONTINUOUS STAIR CORE</span><i />
          <span>ACCURATE ROOM BOUNDS</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
          {onLoadResidenceModel && (
            <button className="home-explore" onClick={onLoadResidenceModel} style={{ fontSize: '13px', padding: '10px 18px', background: '#245a50' }}>
              Load 3-Floor Residence Model (10m × 14m) <span>↗</span>
            </button>
          )}
          {onLoadThreeStorey && (
            <button className="home-explore" onClick={onLoadThreeStorey} style={{ fontSize: '13px', padding: '10px 18px' }}>
              Load 3-Storey Concept Model (36′ × 42′) <span>↗</span>
            </button>
          )}
          <a
            href="/Trishna%203D%20Pitch%20Deck.pptx"
            download="Trishna 3D Pitch Deck.pptx"
            className="home-explore"
            style={{
              fontSize: '13px',
              padding: '10px 18px',
              background: '#345e45',
              color: '#ffffff',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Download full 7-slide PowerPoint presentation (Trishna 3D Pitch Deck.pptx)"
          >
            <span>📊</span> Download Trishna 3D PPT <span>↓</span>
          </a>
          <a
            href="/3dpdf.pdf"
            download="3dpdf.pdf"
            className="home-explore"
            style={{
              fontSize: '13px',
              padding: '10px 18px',
              background: '#204637',
              color: '#ffffff',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Download complete project dossier & hackathon winning pitch (3dpdf.pdf)"
          >
            <span>📄</span> Download 3D PDF Dossier <span>↓</span>
          </a>
        </div>
      </div>

      <button className="preview-card plan-preview-card" onClick={onSampleThreeStorey ?? onSample} aria-label="Download the concept plan and upload guide PDF">
        <div className="plan-paper">
          <div className="paper-top"><b>3-STOREY CONCEPT PLAN</b><span>36' × 42'</span></div>
          <svg className="plan-drawing exact-plan-drawing" viewBox="0 0 300 220" role="img" aria-label="Dimensioned 36 by 42 foot 3-storey concept plan example">
            <rect x="54" y="14" width="192" height="192" fill="#f8f8f1" stroke="#31584e" strokeWidth="2.5" />
            <g stroke="#31584e" strokeWidth="1.5">
              {/* Rear row */}
              <rect x="54" y="14" width="38" height="64" fill="#e3edf0"/><rect x="92" y="14" width="38" height="64" fill="#f4edda"/><rect x="130" y="14" width="40" height="64" fill="#e4efed"/><rect x="170" y="14" width="38" height="64" fill="#e3edf0"/><rect x="208" y="14" width="38" height="64" fill="#e3edf0"/>
              {/* Middle row */}
              <rect x="54" y="78" width="76" height="64" fill="#e5efe8"/><rect x="130" y="78" width="40" height="64" fill="#e8e7df"/><rect x="170" y="78" width="76" height="64" fill="#e2eeec"/>
              {/* Front row */}
              <rect x="54" y="142" width="76" height="64" fill="#eee5d5"/><rect x="130" y="142" width="40" height="64" fill="#efe3d2"/><rect x="170" y="142" width="76" height="64" fill="#eee7dc"/>
            </g>
            <g fill="#31584e" fontFamily="Arial,sans-serif" fontSize="5.3" fontWeight="700" textAnchor="middle">
              <text x="73" y="48">BATH 1</text><text x="111" y="48">STORE</text><text x="150" y="48">UTILITY</text><text x="189" y="48">BATH 2</text><text x="227" y="48">BATH 3+4</text>
              <text x="92" y="112">DINING 12×14</text><text x="150" y="112">LOBBY 8×14</text><text x="208" y="112">KITCHEN 12×14</text>
              <text x="92" y="176">LIVING 12×14</text><text x="150" y="176">STAIR 8×14</text><text x="208" y="176">GUEST 12×14</text>
            </g>
            <path d="M150 204v-12m0 12a12 12 0 0 0-12-12" fill="none" stroke="#c29251" strokeWidth="2"/><text x="160" y="200" fill="#168278" fontFamily="Arial,sans-serif" fontSize="5">Main entry</text>
            <path d="M52 208h196M48 14v192" stroke="#168278" strokeWidth=".8"/><text x="150" y="217" fill="#168278" fontFamily="Arial,sans-serif" fontSize="6" textAnchor="middle">36 ft × 42 ft (3 levels)</text>
          </svg>
          <div className="paper-bottom"><span>5-PAGE PDF · 3-STOREY CONCEPT</span><span>02 / 05</span></div>
        </div>
        <TrishnaMiniBuilding active={!processing} />
        <span className="preview-caption">GET 3-STOREY CONCEPT PDF <b>↓</b></span>
        <span className="preview-sticker"><i>✦</i> 36′ × 42′ model</span>
      </button>
    </section>
    {processing && <div className="processing-card" role="status"><span className="processing-spinner" /><div><b>Reconstructing 3D Model</b><small>Gemini Vision AI is analyzing rooms, dimensions, stairs, and floor sheets…</small></div></div>}
    {message && <div className="upload-message" role="status">{message}</div>}
    <section className="upload-guidance">
      <div><span className="eyebrow">SUPPORTED PLANS</span><h2>What your plan needs.</h2></div>
      <div className="guidance-items">
        <div><b>01</b><span><strong>PDF or Image (PNG/JPG)</strong><small>Upload scanned drawings, CAD exports, screenshots, or multi-page PDF floor sheets.</small></span></div>
        <div><b>02</b><span><strong>Floor Level Detection</strong><small>Ground floor, First/Upper floor, and multi-storey levels are automatically recognized.</small></span></div>
        <div><b>03</b><span><strong>Room Names & Spaces</strong><small>Identifies bedrooms, bathrooms, living spaces, kitchens, lofts, and stairs.</small></span></div>
        <div><b>04</b><span><strong>Walkable 3D Model</strong><small>Generates wall thicknesses, door clearances, materials, and first-person walkthrough.</small></span></div>
      </div>
      <p className="prototype-note">Powered by Google Gemini Vision AI (Flash) with sub-second vector CAD fallback for instant 3D model generation.</p>
    </section>
  </>;
}
