import { formatMoney } from '@/utils/formatMoney'
import { Table, TableBody, TableRow, TableCell, Collapse } from '@mui/material'
import { useState } from 'react'

interface MonthProps {
  month: {
    date: number
    invoices: { id: string; total: number; company: string }[]
    bonus: number
    expansion: number
    total: number
  }
  monthIndex: number
}

const Month = ({ month, monthIndex }: MonthProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const total = month?.invoices.reduce((acc, cur) => acc + cur.total, 0)

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
          {monthIndex + 1}: {isExpanded ? 'Close' : 'Open'}
        </TableCell>
        <TableCell>
          {new Date(month.date).toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </TableCell>
        <TableCell>
          {monthIndex === 11 ? (
            <>
              Subtotal: {formatMoney(total)}
              <hr />
              Expansion: {formatMoney(month.expansion)}
              <hr />
              Total: {formatMoney(total + month.expansion)}
            </>
          ) : (
            formatMoney(total)
          )}
        </TableCell>
        <TableCell>{month.bonus}</TableCell>
        <TableCell>{formatMoney(month.total)}</TableCell>
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
