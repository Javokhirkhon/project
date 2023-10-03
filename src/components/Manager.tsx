import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableFooter,
  TableRow,
  TableCell,
  Paper,
  Typography,
} from '@mui/material'
import Month from './Month'
import { formatMoney } from '@/utils/formatMoney'

interface ManagerProps {
  manager: {
    manager: string
    months: any[]
  }
}

const Manager = ({ manager }: ManagerProps) => {
  const total = manager.months.reduce((acc, cur) => acc + cur.total, 0)

  return (
    <TableContainer component={Paper} style={{ marginBottom: 48 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={5}>
              <Typography variant='h6' fontWeight='bold'>
                {manager.manager}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow
            sx={{
              bgcolor: 'common.black',
              th: {
                width: '20%',
                color: 'common.white',
              },
            }}
          >
            <TableCell># ID</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>Money Received This Month</TableCell>
            <TableCell>Bonus Percentage This Month</TableCell>
            <TableCell>Bonus Received This Month</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {manager.months.map((month, monthIndex) => (
            <Month
              key={monthIndex}
              {...{
                month,
                monthIndex,
              }}
            />
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5} align='right'>
              <Typography variant='h6' color='primary' fontWeight='bold' mb={2}>
                Total: {formatMoney(total)}
              </Typography>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  )
}

export default Manager
