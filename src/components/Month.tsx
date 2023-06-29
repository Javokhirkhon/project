import { formatMoney } from '@/utils/formatMoney'
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  Collapse,
  TextField,
} from '@mui/material'
import { Dispatch, SetStateAction, useState } from 'react'

interface MonthProps {
  month: {
    date: number
    invoices: { id: string; total: number; company: string }[]
    bonus: number
    getTotal: () => number
  }
  data: any[]
  setData: Dispatch<SetStateAction<any[]>>
  managerIndex: number
  monthIndex: number
}

const Month = ({
  month,
  data,
  setData,
  managerIndex,
  monthIndex,
}: MonthProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const total = month?.invoices.reduce((acc, cur) => acc + cur.total, 0)

  const updateBonus = (
    managerIndex: number,
    monthIndex: number,
    newBonus: number
  ) => {
    const newData = { ...data }
    newData[managerIndex].months[monthIndex].bonus = newBonus
    setData(newData)
  }

  return (
    <>
      <TableRow
        sx={{
          td: { width: '20%', fontWeight: isExpanded ? 'bold' : 'normal' },
        }}
      >
        <TableCell
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{
            cursor: 'pointer',
          }}
        >
          {monthIndex}: {isExpanded ? 'Close' : 'Open'}
        </TableCell>
        <TableCell>
          {new Date(month.date).toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </TableCell>
        <TableCell>{formatMoney(total)}</TableCell>
        <TableCell>
          <TextField
            label='Bonus'
            variant='standard'
            value={month.bonus}
            type='number'
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateBonus(managerIndex, monthIndex, parseInt(e.target.value))
            }
          />
        </TableCell>
        <TableCell>{formatMoney(month.getTotal())}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          colSpan={5}
          style={{ padding: 0 }}
          sx={{
            ...(isExpanded
              ? {
                  bgcolor: 'primary.light',
                  td: {
                    width: '20%',
                    color: 'common.white',
                    fontWeight: 'bold',
                  },
                }
              : {
                  bgcolor: 'common.white',
                  td: {
                    width: '20%',
                  },
                }),
          }}
        >
          <Collapse in={isExpanded} timeout='auto' unmountOnExit>
            {month?.invoices?.map((invoice) => (
              <Table key={invoice.id}>
                <TableBody>
                  <TableRow>
                    <TableCell>{invoice.id}</TableCell>
                    <TableCell>{invoice.company}</TableCell>
                    <TableCell>{formatMoney(invoice.total)}</TableCell>
                    <TableCell>{month.bonus}</TableCell>
                    <TableCell>
                      {formatMoney((invoice.total * month.bonus) / 100)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            ))}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

export default Month
