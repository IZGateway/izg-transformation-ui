import React, { useContext } from 'react'
import { DataGrid, GridColDef, GridFooter, GridToolbar } from '@mui/x-data-grid'
import {
  Box,
  IconButton,
  Typography,
  Card,
  Tooltip,
  Button,
} from '@mui/material'
import SessionContext from '../../contexts/app'
import palette from '../../styles/theme/palette'
import EditIcon from '@mui/icons-material/Edit'
import Link from 'next/link'
import AddIcon from '@mui/icons-material/Add'

const dataGridCustom = {
  '&.MuiDataGrid-root.MuiDataGrid-autoHeight.MuiDataGrid-root--densityComfortable':
    {
      marginTop: '-8px',
      zIndex: 1,
      paddingTop: '1em',
      border: 'none',
      marginBottom: '2em',
    },
  '& .MuiDataGrid-main': {
    marginTop: '-8px',
    backgroundColor: palette.white,
    borderRadius: '0 0 30px 30px',
    border: `1px solid ${palette.border}`,
    paddingBottom: '1em',
    boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.25)',
  },
  '& .MuiDataGrid-row:hover': {
    bgcolor: '#00000010',
  },
  '& .MuiFormControl-root.MuiTextField-root.css-3be3ve-MuiFormControl-root-MuiTextField-root-MuiDataGrid-toolbarQuickFilter':
    {
      width: '32vw',
    },
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: palette.white,
  },
  '& .MuiDataGrid-toolbarContainer': {
    display: 'flex',
    flexDirection: 'row-reverse',
    backgroundColor: palette.white,
    padding: '24px 16px 16px 16px',
    boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.25)',
    border: `1px solid ${palette.border}`,
    marginBottom: '8px',
  },
  '& svg.MuiSvgIcon-root.MuiSvgIcon-fontSizeSmall.MuiDataGrid-sortIcon.css-ptiqhd-MuiSvgIcon-root':
    {
      color: palette.primary,
    },
  '& .MuiDataGrid-footerContainer.MuiDataGrid-footerContainer': {
    width: '30em',
    borderRadius: '60px',
    float: 'right',
    margin: '2em 0',
    justifyContent: 'center',
    boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.25)',
    backgroundColor: palette.white,
  },
  '& .MuiTablePagination-actions': {
    color: palette.primary,
  },
  '& .MuiTablePagination-selectIcon.MuiSelect-icon.MuiSelect-iconStandard.css-pqjvzy-MuiSvgIcon-root-MuiSelect-icon':
    {
      color: palette.primary,
    },
  '& .MuiDataGrid-virtualScroller': {
    overflow: 'hidden',
  },
  '.highlight': {
    bgcolor: palette.errorHighLight,
  },
}

const actionButtonStyle = {
  borderRadius: 90,
  background: palette.white,
  boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.40)',
  width: 35,
  height: 35,
  marginRight: 2,
}

const CustomFooter = () => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Link href="/add/mapping" passHref>
        <Button
          sx={{
            borderRadius: '60px',
            float: 'right',
            margin: '2em 0',
            justifyContent: 'center',
            boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.25)',
            backgroundColor: '#FFFFFF',
            py: 1.7,
            px: 3,
            border: `1px solid ${palette.border}`,
          }}
          variant="text"
          color="primary"
          endIcon={<AddIcon />}
        >
          Add New Mapping
        </Button>
      </Link>
      <GridFooter />
    </Box>
  )
}

const MappingTable = (props) => {
  const { pageSize, setPageSize } = useContext(SessionContext)
  const columns: GridColDef[] = [
    {
      field: 'organizationName',
      headerName: 'ORGANIZATION',
      flex: 0.5,
      minWidth: 50,
    },
    {
      field: 'codeSystem',
      headerName: 'SOURCE CODE SYSTEM',
      flex: 0.5,
      minWidth: 50,
    },
    {
      field: 'code',
      headerName: 'SOURCE CODE',
      flex: 0.5,
      minWidth: 50,
    },
    {
      field: 'targetCodeSystem',
      headerName: 'TARGET CODE SYSTEM',
      flex: 0.5,
      minWidth: 25,
    },
    {
      field: 'targetCode',
      headerName: 'TARGET CODE',
      flex: 0.5,
      minWidth: 50,
    },
    {
      field: 'active',
      headerName: 'STATUS',
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) => {
        const isActive = params.row.active
        return (
          <Box
            sx={{
              border: `1.5px solid ${isActive ? '#0d7680' : '#9e9e9e'}`,
              color: isActive ? '#0d7680' : '#9e9e9e',
              borderRadius: '999px',
              px: 1.5,
              py: 0.25,
              fontSize: '0.8rem',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {isActive ? 'Active' : 'Not Active'}
          </Box>
        )
      },
    },
    {
      field: 'action',
      headerName: 'ACTION',
      sortable: false,
      filterable: false,
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) => {
        return (
          <div>
            <Link
              prefetch={false}
              tabIndex={props.tabIndex}
              href={{
                pathname: `/edit/mapping/${params.row.id}`,
              }}
            >
              <Tooltip arrow placement="bottom" title="Edit">
                <IconButton
                  id={'edit_' + params.row.id}
                  aria-label="edit"
                  color="primary"
                  sx={actionButtonStyle}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Link>
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <Box>
        <Card
          sx={{
            position: 'relative',
            zIndex: 10,
            height: 'auto',
            boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.40)',
            marginBottom: '-16px',
          }}
        >
          <Typography
            id="title-table"
            sx={{ padding: 2, fontSize: '1.75rem', fontWeight: 700 }}
            flexGrow={1}
            display="flex"
            align="center"
          >
            Mapping
          </Typography>
        </Card>
      </Box>

      <DataGrid
        experimentalFeatures={{ ariaV7: true }}
        sx={dataGridCustom}
        rows={props.data}
        columns={columns}
        pageSizeOptions={[5, 25, 50, 100]}
        autoHeight
        initialState={{
          sorting: {
            sortModel: [{ field: 'organizationName', sort: 'asc' }],
          },
          pagination: { paginationModel: { pageSize } },
        }}
        disableRowSelectionOnClick
        disableColumnMenu
        disableColumnSelector
        disableDensitySelector
        onPaginationModelChange={(model) => setPageSize(model.pageSize)}
        getRowId={(row) => row.id}
        getRowClassName={(params) => {
          return params.row.hasActiveMaint === true ? 'highlight' : ''
        }}
        density={'comfortable'}
        pagination
        slots={{
          footer: () => <CustomFooter />,
        }}
        components={{ Toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
            printOptions: { disableToolbarButton: true },
            columns: { field: 'action', filterable: false },
            csvOptions: { disableToolbarButton: true },
          },
          panel: {
            placement: 'bottom-end',
            sx: {
              '& .MuiTypography-root': {
                fontSize: 20,
              },
              '& .MuiDataGrid-filterForm': {
                flexDirection: 'column',
                gap: '8px',
              },
              '& .MuiDataGrid-filterFormColumnInput': {
                width: '100%',
                display: 'flex',
              },
              '& .MuiDataGrid-filterFormOperatorInput': {
                width: '100%',
              },
              '& .MuiDataGrid-paper': {
                marginTop: '-73px',
                paddingBottom: '3vh',
                paddingTop: '1vh',
                paddingRight: '1vh',
                paddingLeft: '1vh',
                borderRadius: '0 0 30px 30px',
                border: `1px solid ${palette.border}`,
                width: 'fit-content',
              },
              '& .MuiDataGrid-filterFormDeleteIcon': {
                flexDirection: 'row',
                marginRight: '-4px',
                marginBottom: '-16px',
                color: 'green',
              },
              '& .MuiDataGrid-filterFormValueInput': {
                width: '100%',
              },
            },
          },
        }}
      />
    </div>
  )
}

export default MappingTable
