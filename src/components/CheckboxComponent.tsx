'use client'
import { Checkbox } from "primereact/checkbox";
import { useState } from "react";
import * as XLSX from 'xlsx';

export const CheckboxComponent = ({ id, name, onCheckboxChange }) => {
  const [checked, setChecked] = useState(false);

  const handleCheckboxChange = (e) => {
    setChecked(e.checked);
    onCheckboxChange({ id, name, checked: e.checked });
  };

  return (
    <div>
      <Checkbox 
        onChange={handleCheckboxChange} 
        checked={checked} 
      />
    </div>
  );
};