'use client'
import { Checkbox } from 'primereact/checkbox';
import React, { useState } from "react";

export default function CheckItem({id}) {
    const [checked, setChecked] = useState(false);

     return (
        <div className="flex text-center justify-content-center">
            <Checkbox key={id} onChange={e => setChecked(e.checked)} checked={checked}></Checkbox>
        </div>
    )
}
