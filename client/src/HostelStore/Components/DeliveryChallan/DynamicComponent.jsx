import { PartyMaster, StyleMaster } from "..";




const DynamicRenderer = ({ openModelForAddress, onCloseForm, componentName, editingItem , childId ,dynamicForm , setDynamicForm }) => {
    console.log(componentName,"componentName")


    const COMPONENTS = {
        PartyMaster: () => <PartyMaster partyId={editingItem} onCloseForm={onCloseForm} openModelForAddress={openModelForAddress} 
        childId={childId}
        />,
        // EmployeeCategoryMaster: () => <EmployeeCategoryMaster />,
        StyleMaster: () => <StyleMaster styleId={editingItem} dynamicForm={dynamicForm} setDynamicForm={setDynamicForm}  />,
    };

    const ComponentToRender = COMPONENTS[componentName];

    console.log(ComponentToRender,"ComponentToRender")

    return ComponentToRender ? <ComponentToRender /> : <div>Not found</div>;
};

export default DynamicRenderer