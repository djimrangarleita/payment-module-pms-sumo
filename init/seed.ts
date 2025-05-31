import sql from 'mssql';
import { config } from '../src/config';

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    const pool = await sql.connect({
      ...config,
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    });

    console.log('Creating TestTable if it doesn\'t exist...');
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TestTable]') AND type in (N'U'))
      BEGIN
          CREATE TABLE [dbo].[TestTable] (
              [id] INT IDENTITY(1,1) PRIMARY KEY,
              [name] NVARCHAR(100) NOT NULL,
              [value] INT NOT NULL,
              [created_at] DATETIME DEFAULT GETDATE(),
              [updated_at] DATETIME DEFAULT GETDATE()
          )
      END
    `);

    console.log('Checking if table is empty...');
    const result = await pool.request().query('SELECT COUNT(*) as count FROM TestTable');
    const count = result.recordset[0].count;

    if (count === 0) {
      console.log('Inserting test data...');
      await pool.request().query(`
        INSERT INTO [dbo].[TestTable] (name, value) VALUES 
          ('Item 1', 100),
          ('Item 2', 200),
          ('Item 3', 300)
      `);
      console.log('Test data inserted successfully!');
    } else {
      console.log('Table already contains data, skipping insertion.');
    }

    await pool.close();
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase(); 