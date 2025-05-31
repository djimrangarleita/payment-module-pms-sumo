import sql from 'mssql';
import { config } from '../src/config';

async function updateRecord(id: number, name?: string, value?: number) {
  try {
    console.log('Connecting to database...');
    const pool = await sql.connect({
      ...config,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    });

    // Build the update query based on provided parameters
    let updateFields: string[] = [];
    let params: any = { id };

    if (name !== undefined) {
      updateFields.push('name = @name');
      params.name = name;
    }
    if (value !== undefined) {
      updateFields.push('value = @value');
      params.value = value;
    }

    if (updateFields.length === 0) {
      console.log('No fields to update provided');
      return;
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = GETDATE()');

    const query = `
      UPDATE [dbo].[TestTable]
      SET ${updateFields.join(', ')}
      WHERE id = @id
    `;

    const request = pool.request();
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });

    const result = await request.query(query);
    
    if (result.rowsAffected[0] === 0) {
      console.log(`No record found with id ${id}`);
    } else {
      console.log(`Successfully updated record with id ${id}`);
    }

    await pool.close();
  } catch (error) {
    console.error('Error updating record:', error);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const id = parseInt(args[0], 10);
const name = args[1];
const value = args[2] ? parseInt(args[2], 10) : undefined;

if (!id || isNaN(id)) {
  console.log('Usage: npm run update <id> [name] [value]');
  console.log('Example: npm run update 1 "New Name" 500');
  process.exit(1);
}

updateRecord(id, name, value); 