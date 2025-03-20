'use client';
import { useState, useEffect, useMemo } from 'react';
import db from '../../utils/firestore';
import { collection, setDoc, doc } from 'firebase/firestore';
import { auth } from '../../../firebaseConfig';
import { useRouter } from 'next/navigation';
import { deleteCookie } from '../../serverActions';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import localeData from 'dayjs/plugin/localeData';
import {
  Button,
  Paper,
  Grid2 as Grid,
  Select,
  MenuItem,
  FormControl,
  Typography,
} from '@mui/material';
import { DataGrid, GridRowModes } from '@mui/x-data-grid';
import './style.css';

export default function Home() {
  const [value, setValue] = useState('testetetetet');
  const [month, setMonth] = useState('January');
  const [showPagination, setShowPagination] = useState(false);
  const [rowModesModel, setRowModesModel] = useState({});
  const ITEMS_PER_PAGE = 50;

  // TODO: grab values from Database
  // TODO: either change to context API or redux(mobx)
  const [budgetData, setBudgetData] = useState({
    income: {
      rows: [],
      columns: [
        { field: 'name', headerName: 'Name', flex: 3, editable: true },
        { field: 'planned', headerName: 'Planned', flex: 1, editable: true },
        { field: 'received', headerName: 'Received', flex: 1, editable: true },
        // {
        //   field: 'fullName',
        //   headerName: 'Full name',
        //   description: 'This column has a value getter and is not sortable.',
        //   sortable: false,
        //   width: 160,
        //   valueGetter: (value, row) =>
        //     `${row.firstName || ''} ${row.lastName || ''}`,
        // },
      ],
    },
  });
  const paginationModel = { page: 0, pageSize: ITEMS_PER_PAGE };

  const router = useRouter();
  dayjs.extend(duration);
  dayjs.extend(localeData);
  const listOfMonths = dayjs.months();

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      const docRef = await setDoc(doc(db, 'users', user.uid), {
        name: value,
      });
      setValue('');
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  const handleAddIncome = () => {
    const id = budgetData.income.rows.length + 1;
    const newRow = {
      id,
      name: '',
      planned: 0,
      received: 0,
      isNew: true,
    };

    const newBudgetData = {
      ...budgetData,
      income: {
        ...budgetData.income,
        rows: [...budgetData.income.rows, newRow],
      },
    };
    setBudgetData(newBudgetData);

    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
    }));
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleAddNewCategory = (categoryName) => {
    setBudgetData((oldBudgetData) => ({
      ...oldBudgetData,
      [categoryName]: {
        rows: [],
        columns: [
          { field: 'name', headerName: 'Name', flex: 3, editable: true },
          { field: 'planned', headerName: 'Planned', flex: 1, editable: true },
          {
            field: 'received',
            headerName: 'Received',
            flex: 1,
            editable: true,
          },
        ],
      },
    }));
  };

  useEffect(() => {
    // Only display pagination if greater than items per page max
    if (budgetData.income.rows.length > ITEMS_PER_PAGE && !showPagination) {
      setShowPagination(true);
    } else {
      setShowPagination(false);
    }
  }, [budgetData]);

  return (
    <div className="home">
      <div className="content">
        <div className="budget">
          {/* <main>
          <button onClick={handleSubmit}>Write to DB</button>
        </main> */}
          <div className="monthSelector">
            <FormControl variant="standard">
              <Select
                labelId="month-selector"
                value={month}
                onChange={(event) => {
                  setMonth(event.target.value);
                }}
                sx={{
                  '.MuiSelect-select': {
                    fontSize: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: 'bold',
                  },
                }}
              >
                {listOfMonths.map((el) => (
                  <MenuItem key={el} value={el}>
                    {el}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          {/* Make this into a component **********/}
          <div>
            <Typography
              variant="h5"
              sx={{
                margin: '5px',
              }}
            >
              Income
            </Typography>
            <Paper elevation={3}>
              <DataGrid
                editMode="row"
                rowModesModel={rowModesModel}
                rows={budgetData.income.rows}
                columns={budgetData.income.columns}
                initialState={{ pagination: { paginationModel } }}
                sx={{
                  border: 0,
                  '.mui-1swebvn-MuiTablePagination-root': {
                    display: showPagination ? 'block' : 'none',
                  },
                }}
                // pageSizeOptions={[5, 10]}
              />
              <Button onClick={handleAddIncome}> Add Income</Button>
            </Paper>
          </div>
          <Button variant="contained" onClick={handleAddNewCategory}>
            New Category
          </Button>
        </div>

        <div className="report">TETETETET</div>
      </div>

      <div className="footer">
        <Button
          onClick={async (e) => {
            // TODO: Change sign out to a server action
            auth.signOut();
            await deleteCookie('firebase_token');
            router.push('/login');
          }}
          variant="contained"
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
