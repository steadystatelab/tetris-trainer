#!/bin/bash
find src -type f -name "*.ts" -o -name "*.tsx" | while read -r file; do
    sed -i 's/import { Matrix/import type { Matrix/' "$file"
    sed -i 's/import { PieceType/import type { PieceType/' "$file"
    sed -i 's/import { Point/import type { Point/' "$file"
    sed -i 's/import { RotationState/import type { RotationState/' "$file"
    sed -i 's/import { LockContext/import type { LockContext/' "$file"
    sed -i 's/import { Cell/import type { Cell/' "$file"
    sed -i 's/import { TSpinResult/import type { TSpinResult/' "$file"
    sed -i 's/import { TSpinType/import type { TSpinType/' "$file"
    sed -i 's/import { KickOffset/import type { KickOffset/' "$file"
    sed -i 's/import { TaskCategory/import type { TaskCategory/' "$file"
    sed -i 's/import { TargetAction/import type { TargetAction/' "$file"
    sed -i 's/import { TaskDefinition/import type { TaskDefinition/' "$file"
    sed -i 's/import { GameState/import type { GameState/' "$file"
done
