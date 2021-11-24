import { React, useEffect, useState, useContext } from 'react'
import ItemAssignment from '../ItemAssignment'
import assignmentAPI from '../../../APIs/assignmentAPI'
import { useParams } from 'react-router-dom'
import ErrorPage from '../../ErrorPage'
import List from '@mui/material/List'
import Box from '@mui/material/Box'
import '../index.scss'
import { NavbarElContext } from '../../../Context/GlobalContext';
import ClassroomTabs from '../../ClassroomTabs'
import NavbarAddButton from '../../NavbarAddButton'
import AddAssignmentFormDialog from '../AddAssignmentFormDialog'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function ListAssignment() {
    const [error, setError] = useState(null)
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const params = useParams()
    const [,setNavbarEl] = useContext(NavbarElContext)
    const [openAddDialog, setOpenAddDialog] = useState(false)
    const [toggleAddNew, setToggleAddNew] = useState(false)

    function array_move(arr, old_index, new_index) {
        if (new_index >= arr.length) {
            var k = new_index - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr; // for testing
    };
    function handleOnDragEnd(result){
        console.log(result);
        if (!result.destination) return;
        if(result.destination.index === result.source.index) return;
        console.log('Before:\n',items);
        let items_list = Array.from(items); 
        items_list = array_move(items_list, result.source.index, result.destination.index);
        console.log('After:\n', items_list);
        setItems(items_list);
        console.log('After-items:\n', items);
    }
    useEffect(() => {
        
        async function fetchData() {
            const response = await assignmentAPI.getAllAssignments(params.classroomId)
            
            if (!response.ok) {
                setError(response.status)
                setItems([])
            }
            else {
                const response_data = await response.json()
                setItems(response_data)
                setLoading(false)
            }
        }
        setNavbarEl({
            classroomTabs: (<ClassroomTabs value={1} classroomId={params.classroomId} />),
            addButton: (<NavbarAddButton onClick={() => setOpenAddDialog(true)} />)
        })
        fetchData()
    }, [params.classroomId, setNavbarEl, toggleAddNew])

    if (error)
        return <ErrorPage status={error}/>
    else if (loading)
        return <div>Loading...</div>
    else
        return (
            // <Box className='container'>
            //     <AddAssignmentFormDialog handleAdded={() => setToggleAddNew(!toggleAddNew)} status={openAddDialog} handleClose={() => setOpenAddDialog(false)} />
            //     <h1 className="container__page-title">Assignments</h1>
            //     <List className='container__assignment-list'>{
            //         items.map((item, index) => {
            //             const cloneItem = {...item}
            //             console.log(cloneItem, index)
            //             return (<ItemAssignment key={index} assignment={cloneItem} toggleChangeItem={() => setToggleAddNew(!toggleAddNew)}/>)
            //         })
            //     }</List>
            // </Box>

            <Box className='container'>
                <AddAssignmentFormDialog handleAdded={() => setToggleAddNew(!toggleAddNew)} status={openAddDialog} handleClose={() => setOpenAddDialog(false)} />
                <h1 className="container__page-title">Assignments</h1>
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="droppable">
                        {(provided) => (
                                <List className='container__assignment-list'ref={provided.innerRef} {...provided.droppableProps}>{
                                    items.map((item, index) => {
                                        const cloneItem = {...item}
                                        // console.log(cloneItem, index)
                                        return (<Draggable key={index} draggableId={index.toString()} index={index}>
                                                    {(provided) => {
                                                        return (<div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                    <ItemAssignment 
                                                                        key={index} 
                                                                        assignment={cloneItem} 
                                                                        toggleChangeItem={() => setToggleAddNew(!toggleAddNew)}/>
                                                                </div>)
                                                    }}
                                                </Draggable>)
                                    })}
                                    {provided.placeholder}
                                </List>
                        )}
                    </Droppable>
                </DragDropContext>
            </Box>
        )
}
                            
