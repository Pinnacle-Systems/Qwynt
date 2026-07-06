import React from 'react'
import { TextArea } from '../../../Inputs'

const Consolidation = ({
  remarks,
  setRemarks,
  readOnly
}) => {
  return (
    <div className="fixed bottom-2 w-full bg-gray-50 text-xs px-2 py-2 shadow ">
      <div className="flex items-center space-x-2 px-2">
        <TextArea
          name="Remarks"
          value={remarks}
          setValue={setRemarks}
          readOnly={readOnly}
          rows={3} // Increased height here
          cols={80} // Optional: wider if you want
          className="text-xs rounded-lg border-gray-400 focus:ring-2 focus:ring-blue-300"
        />
      </div>
    </div>
  )
}

export default Consolidation
