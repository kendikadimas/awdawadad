<div className="flex items-center gap-3">
        <ToggleButton pressed={showGrid} onPressedChange={onToggleGrid}>Grid</ToggleButton>
        <ToggleButton pressed={snapToGrid} onPressedChange={onToggleSnap}>Snap</ToggleButton>
        <span className="text-xs text-gray-500">x: {coordinate.x.toFixed(0)} y: {coordinate.y.toFixed(0)}</span>
        <AutosaveStatus status={autosaveStatus} />
    </div>