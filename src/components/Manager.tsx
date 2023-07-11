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
    invoices: any[]
    months: any[]
  }
  currentMonth: Date
  previousMonth: Date
}

const Manager = ({ manager, currentMonth, previousMonth }: ManagerProps) => {
  const total = manager.months.reduce((acc, cur) => acc + cur.getTotal(), 0)

  const newMRR = manager?.months[manager?.months?.length - 1]?.invoices.reduce(
    (acc: number, cur: { total: number }) => acc + cur.total,
    0
  )

  const expansionLeft = manager.invoices
    .filter(
      ({ date, start_date }) =>
        new Date((date + 18000) * 1000) >= currentMonth &&
        new Date(start_date) >= previousMonth &&
        new Date(start_date) < currentMonth
    )
    .reduce((acc, cur) => acc + cur.total, 0)

  const expansionRight = manager.invoices
    .filter(
      ({ date, start_date }) =>
        new Date((date + 18000) * 1000) < currentMonth &&
        new Date((date + 18000) * 1000) >= previousMonth &&
        new Date(start_date) < currentMonth &&
        new Date(start_date) >= previousMonth
    )
    .reduce((acc, cur) => acc + cur.total, 0)

  const expansion = expansionLeft - expansionRight

  const execution = newMRR + expansion

  return (
    <TableContainer component={Paper} style={{ marginBottom: 48 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={5}>
              <Typography variant='h6' fontWeight='bold'>
                {manager.manager} | New MRR ({formatMoney(newMRR)}) + Expansion
                ({formatMoney(expansion)}) = Execution ({formatMoney(execution)}
                )
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
