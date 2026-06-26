import { Check, Trash , Pencil,  } from "lucide-react";
import { useEffect, useRef, useState, ReactNode } from "react";
import { FinanceItem } from "../types";

interface Props {
  item: FinanceItem;
  onEdit: (item: FinanceItem) => void;
  onDelete: (id: string) => void;
  children: ReactNode;
}

const REVEAL_W = 140;
const SWIPE_THRESHOLD = 45;

export default function SwipeableRow({ item, onEdit, onDelete, children }: Props) {
  const [swiped, setSwiped] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const didSwipeRef = useRef(false);

  useEffect(() => {
    if (!swiped) return;
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) {
        setSwiped(false);
        setConfirmDelete(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [swiped]);

  function handlePointerDown(e: React.PointerEvent) {
    startXRef.current = e.clientX;
    didSwipeRef.current = false;
  }

  function handlePointerUp(e: React.PointerEvent) {
    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) >= 8) {
      didSwipeRef.current = true;
      if (dx < -SWIPE_THRESHOLD) setSwiped(true);
      else if (dx > SWIPE_THRESHOLD) { setSwiped(false); setConfirmDelete(false); }
    }
  }

  // Capture phase so we intercept before inner onClick handlers
  function handleClickCapture(e: React.MouseEvent) {
    if (didSwipeRef.current) {
      e.stopPropagation();
      didSwipeRef.current = false;
      return;
    }
    if (swiped) {
      setSwiped(false);
      setConfirmDelete(false);
      e.stopPropagation();
    }
  }

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); }
    else { onDelete(item.id); setSwiped(false); setConfirmDelete(false); }
  }

  function handleEdit() { setSwiped(false); onEdit(item); }

  return (
    <div ref={rowRef} style={{ position: "relative", overflow: "hidden" }}>
      <div className="swipe-actions" style={{ opacity: swiped ? 1 : 0, transition: "opacity 0.2s ease" }}>
        <button type="button" className="swipe-btn swipe-edit" onClick={handleEdit}>
          <span className="swipe-icon"><Pencil size={16} /></span>
          <span className="swipe-label">Edit</span>
        </button>
        <button
          type="button"
          className={`swipe-btn swipe-delete ${confirmDelete ? "confirm" : ""}`}
          onClick={handleDelete}
        >
          <span className="swipe-icon">{confirmDelete ? <Check size={16} /> : <Trash size={16} />}</span>
          <span className="swipe-label">{confirmDelete ? "Sure?" : "Delete"}</span>
        </button>
      </div>

      <div
        style={{
          transform: swiped ? `translateX(-${REVEAL_W}px)` : "translateX(0)",
          transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
          position: "relative",
          zIndex: 1,
          background: "var(--surface)",
          touchAction: "pan-y",
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClickCapture={handleClickCapture}
      >
        {children}
      </div>
    </div>
  );
}
