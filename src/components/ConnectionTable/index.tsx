import React, { useContext } from 'react'
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid'
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined'
import {
  Box,
  IconButton,
  Typography,
  Card,
  Tooltip,
  CardHeader,
  CardContent,
} from '@mui/material'

import CheckIcon from '@mui/icons-material/Check'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import SessionContext from '../../contexts/app'
import palette from '../../styles/theme/palette'
import moment from 'moment'
import _ from 'lodash'

const dataGridCustom = {
  '&.MuiDataGrid-root.MuiDataGrid-autoHeight.MuiDataGrid-root--densityComfortable':
    {
      marginTop: '-8px',
      zIndex: 1,
      paddingTop: '1em',
      border: 'none',
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

const ConnectionsTable = (props) => {
  const { pageSize, setPageSize } = useContext(SessionContext)
  const columns: GridColDef[] = [
    {
      field: 'organizationName',
      headerName: 'ORGANIZATION',
      flex: 0.5,
      minWidth: 50,
    },
    {
      field: 'pipelines.pipelineName',
      headerName: 'NAME',
      flex: 0.5,
      minWidth: 50,
    },
    {
      field: 'pipelines.inboundEndpoint.endpointName',
      headerName: 'INBOUND ENDPOINT',
      flex: 0.5,
      minWidth: 50,
    },
    {
      field: 'jurisdictionName',
      headerName: 'OUTBOUND ENDPOINT',
      flex: 0.5,
      minWidth: 25,
    },
    {
      field: 'destUri',
      headerName: 'DESCRIPTION',
      flex: 0.5,
      minWidth: 50,
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
            <IconButton
              aria-label="test"
              color="primary"
              sx={actionButtonStyle}
            >
              <MonitorHeartOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="test"
              color="primary"
              sx={actionButtonStyle}
            >
              <MonitorHeartOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="test"
              color="primary"
              sx={actionButtonStyle}
            >
              <MonitorHeartOutlinedIcon fontSize="small" />
            </IconButton>
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
            sortModel: [{ field: 'ORGANIZATION', sort: 'asc' }],
          },
          pagination: { paginationModel: { pageSize } },
          columns: {
            columnVisibilityModel: {
              //destTypeId: false,
            },
          },
        }}
        disableRowSelectionOnClick
        disableColumnMenu
        disableColumnSelector
        disableDensitySelector
        onPaginationModelChange={(model) => setPageSize(model.pageSize)}
        getRowId={(row) => row.destId + row.destTypeId}
        getRowClassName={(params) => {
          return params.row.hasActiveMaint === true ? 'highlight' : ''
        }}
        density={'comfortable'}
        pagination
        components={{ Toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
            printOptions: { disableToolbarButton: true },
            columns: { field: 'action', filterable: false },
            // csvOptions: {
            //   fields: ['destType', 'jurisdictionName', 'destUri', 'status'],
            // },
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

export default ConnectionsTable
