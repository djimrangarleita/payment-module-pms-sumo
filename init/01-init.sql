-- Create the test table
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

-- Insert some initial test data if the table is empty
IF NOT EXISTS (SELECT TOP 1 * FROM [dbo].[TestTable])
BEGIN
    INSERT INTO [dbo].[TestTable] (name, value) VALUES 
        ('Item 1', 100),
        ('Item 2', 200),
        ('Item 3', 300)
END 