#!/bin/bash
set -e

# Wait for SQL Server to be ready
sleep 30s

# Run the initialization script
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "${DB_PASSWORD}" -d master -i /docker-entrypoint-initdb.d/01-init.sql 