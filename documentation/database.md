# Database

Data storage will be needed for application data.

## MongoDB

MongoDB was chosen for the following reasons:

1. Flexibility as a non-relational database management system there is no need to specify data structure so changing that structure requires no database migration. Accounting for any structure of data returned from a database server should be standard practice and therefore RDBMS's provide no benefit.
2. There are many production hosting choices from Atlas-DB, to dockerized self-hosting, to self-hosting a server instance.

### Initialization Scripts

All initialization required by the database needs to exist in a directory mapped to the database container's `/docker-entrypoint-initdb.d` directory. A checksum of this directories contents will indicate if the database needs to be re-initialized.

### Indexing

In order to search for keywords on specific fields on a document in a collection, MongoDB requires a text index be created.
