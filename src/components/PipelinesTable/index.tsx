import React, { useContext } from 'react'
import { DataGrid, GridColDef, GridFooter, GridToolbar } from '@mui/x-data-grid'
import {
  Box,
  Button,
  IconButton,
  Typography,
  Card,
  Tooltip,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline'
import SessionContext from '../../contexts/app'
import palette from '../../styles/theme/palette'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import Link from 'next/link'

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

const CustomFooter = () => (
  <Box display="flex" justifyContent="space-between" alignItems="center">
    <Button
      id="add-new-pipeline"
      data-testid="add-new-pipeline-button"
      component={Link}
      href="/add/pipeline"
      prefetch={false}
      sx={{
        borderRadius: '60px',
        margin: '2em 0',
        boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.25)',
        backgroundColor: palette.white,
        py: 1.7,
        px: 3,
        border: `1px solid ${palette.border}`,
      }}
      variant="text"
      color="primary"
      endIcon={<AddIcon />}
    >
      Add New Pipeline
    </Button>
    <GridFooter />
  </Box>
)

const actionButtonStyle = {
  borderRadius: 90,
  background: palette.white,
  boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.40)',
  width: 35,
  height: 35,
  marginRight: 2,
}

const PipelinesTable = (props) => {
  const { pageSize, setPageSize } = useContext(SessionContext)
  const columns: GridColDef[] = [
    {
      field: 'organizationName',
      headerName: 'ORGANIZATION',
      flex: 0.5,
      minWidth: 50,
    },
    {
      field: 'pipelineName',
      headerName: 'NAME',
      flex: 0.5,
      minWidth: 50,
    },
    {
      field: 'inboundEndpoint',
      headerName: 'INBOUND ENDPOINT',
      flex: 0.5,
      minWidth: 50,
    },
    {
      field: 'outboundEndpoint',
      headerName: 'OUTBOUND ENDPOINT',
      flex: 0.5,
      minWidth: 25,
    },
    {
      field: 'description',
      headerName: 'DESCRIPTION',
      flex: 0.5,
      minWidth: 50,
    },
    {
      field: 'active',
      headerName: 'STATUS',
      flex: 0.3,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {params.value ? (
            <CheckCircleIcon sx={{ fontSize: 18, color: palette.active }} />
          ) : (
            <RemoveCircleOutlineIcon
              sx={{ fontSize: 18, color: palette.greyDarkTypography }}
            />
          )}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
            }}
          >
            {params.value ? 'Active' : 'Inactive'}
          </Typography>
        </Box>
      ),
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
            <Tooltip arrow placement="bottom" title="Edit">
              <IconButton
                id={'edit_' + params.row.id}
                aria-label="edit"
                color="primary"
                sx={actionButtonStyle}
                component={Link}
                prefetch={false}
                tabIndex={props.tabIndex}
                href={`/edit/pipeline/${params.row.id}`}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
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
            My Pipelines
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
        slots={{ footer: () => <CustomFooter />, toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
            printOptions: { disableToolbarButton: true },
            columns: { field: 'action', filterable: false },
            csvOptions: {
              fields: [
                'organizationName',
                'name',
                'inboundEndpoint',
                'outboundEndpoint',
                'description',
              ],
            },
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

export default PipelinesTable
