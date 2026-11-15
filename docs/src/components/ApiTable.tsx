import type { ApiRow } from '../api';

export const ApiTable = ({ rows, typeHeader = 'Type' }: { rows: ApiRow[]; typeHeader?: string }) => (
  <div className="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>{typeHeader}</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name}>
            <td>
              <code>{row.name}</code>
            </td>
            <td>
              <code>{row.type}</code>
            </td>
            <td>{row.default ? <code>{row.default}</code> : '—'}</td>
            <td>{row.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
