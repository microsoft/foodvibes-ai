SET ANSI_NULLS ON
SET QUOTED_IDENTIFIER ON

DROP FUNCTION IF EXISTS dbo.foodvibes_get_role_names_from_access_mask;

DROP VIEW IF EXISTS dbo.foodvibes_tracking_products_ledger_view;
DROP VIEW IF EXISTS dbo.foodvibes_geotrack_ledger_view;
DROP VIEW IF EXISTS dbo.foodvibes_product_ledger_view;
DROP VIEW IF EXISTS dbo.foodvibes_sc_group_ledger_view;
DROP VIEW IF EXISTS dbo.foodvibes_sc_user_ledger_view;
DROP VIEW IF EXISTS dbo.foodvibes_sc_circle_ledger_view;

DROP TABLE IF EXISTS dbo.foodvibes_constants;
DROP TABLE IF EXISTS dbo.foodvibes_geotrack;
DROP TABLE IF EXISTS dbo.foodvibes_product;
DROP TABLE IF EXISTS dbo.foodvibes_tracking_products;
DROP TABLE IF EXISTS dbo.foodvibes_sc_group;
DROP TABLE IF EXISTS dbo.foodvibes_sc_user;
DROP TABLE IF EXISTS dbo.foodvibes_sc_circle;

GO
-- Create functions
CREATE FUNCTION dbo.foodvibes_get_role_names_from_access_mask (@access_mask INT)
RETURNS @payload TABLE (active_roles NVARCHAR(64), active_roles_long NVARCHAR(256))
AS
BEGIN
    DECLARE @result NVARCHAR(MAX)
    DECLARE @result_long NVARCHAR(MAX)
    -- Declare a table variable to simulate an array of strings
    DECLARE @string_array TABLE (ID INT IDENTITY(1,1), Value NVARCHAR(8))
    DECLARE @string_array_long TABLE (ID INT IDENTITY(1,1), Value NVARCHAR(32))

    IF @access_mask & 1 = 1
    BEGIN -- 00001
        INSERT INTO @string_array (Value) VALUES ('POR')
        INSERT INTO @string_array_long (Value) VALUES ('Product Owner')
    END
    IF @access_mask & 2 = 2
    BEGIN -- 00010
        INSERT INTO @string_array (Value) VALUES ('GOR')
        INSERT INTO @string_array_long (Value) VALUES ('Geotrack Owner Role')
    END
    IF @access_mask & 4 = 4
    BEGIN -- 00100
        INSERT INTO @string_array (Value) VALUES ('SCOR')
        INSERT INTO @string_array_long (Value) VALUES ('Supply Chain Owner Role')
    END
    IF @access_mask & 8 = 8
    BEGIN -- 01000
        INSERT INTO @string_array (Value) VALUES ('SCVR')
        INSERT INTO @string_array_long (Value) VALUES ('Supply Chain Viewer Role')
    END
    IF @access_mask & 16 = 16
    BEGIN -- 10000
        INSERT INTO @string_array (Value) VALUES ('GLR')
        INSERT INTO @string_array_long (Value) VALUES ('Global Role')
    END

    SELECT @result = STRING_AGG(Value, ', ') FROM @string_array
    SELECT @result_long = STRING_AGG(Value, ', ') FROM @string_array_long
    INSERT INTO @payload (active_roles, active_roles_long)
        VALUES (@result, @result_long)

    RETURN
END
GO


-- Create tables
CREATE TABLE [dbo].[foodvibes_constants](
	[constant_id] [int] IDENTITY(1,1) NOT NULL,
	[group_name] [nvarchar](max) NOT NULL,
	[constant_name] [nvarchar](max) NOT NULL,
	[constant_value] [int] NOT NULL,
	[ledger_start_transaction_id] [bigint] GENERATED ALWAYS AS transaction_id START HIDDEN NOT NULL,
	[ledger_end_transaction_id] [bigint] GENERATED ALWAYS AS transaction_id END HIDDEN NULL,
	[ledger_start_sequence_number] [bigint] GENERATED ALWAYS AS sequence_number START HIDDEN NOT NULL,
	[ledger_end_sequence_number] [bigint] GENERATED ALWAYS AS sequence_number END HIDDEN NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
WITH
(
SYSTEM_VERSIONING = ON (HISTORY_TABLE = [dbo].[foodvibes_constants_history]), 
LEDGER = ON (LEDGER_VIEW = [dbo].[foodvibes_constants_Ledger] (TRANSACTION_ID_COLUMN_NAME = [ledger_transaction_id], SEQUENCE_NUMBER_COLUMN_NAME = [ledger_sequence_number], OPERATION_TYPE_COLUMN_NAME = [ledger_operation_type], OPERATION_TYPE_DESC_COLUMN_NAME = [ledger_operation_type_desc]))
)
GO
ALTER TABLE [dbo].[foodvibes_constants] ADD  CONSTRAINT [PK_foodvibes_constants] PRIMARY KEY CLUSTERED 
(
	[constant_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FoodVibes Contants/Lookup records' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'foodvibes_constants'
GO

CREATE TABLE [dbo].[foodvibes_geotrack](
	[ledger_id] [int] IDENTITY(1,1) NOT NULL,
	[geotrack_id] [nvarchar](64) NOT NULL,
	[name] [nvarchar](max) NOT NULL,
	[details] [nvarchar](max) NULL,
	[latitude] [float] NOT NULL,
	[longitude] [float] NOT NULL,
	[recorded_at] [datetime2](7) NULL,
	[properties] [nvarchar](max) NULL,
	[operation] [int] NULL,
    [image_id] [nvarchar](max) NULL,
	[created_at] [datetime2](7) NULL,
	[username] [nvarchar](max) NOT NULL,
	[ledger_start_transaction_id] [bigint] GENERATED ALWAYS AS transaction_id START HIDDEN NOT NULL,
	[ledger_end_transaction_id] [bigint] GENERATED ALWAYS AS transaction_id END HIDDEN NULL,
	[ledger_start_sequence_number] [bigint] GENERATED ALWAYS AS sequence_number START HIDDEN NOT NULL,
	[ledger_end_sequence_number] [bigint] GENERATED ALWAYS AS sequence_number END HIDDEN NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
WITH
(
SYSTEM_VERSIONING = ON (HISTORY_TABLE = [dbo].[foodvibes_geotrack_history]), 
LEDGER = ON (LEDGER_VIEW = [dbo].[foodvibes_geotrack_Ledger] (TRANSACTION_ID_COLUMN_NAME = [ledger_transaction_id], SEQUENCE_NUMBER_COLUMN_NAME = [ledger_sequence_number], OPERATION_TYPE_COLUMN_NAME = [ledger_operation_type], OPERATION_TYPE_DESC_COLUMN_NAME = [ledger_operation_type_desc]))
)
GO
ALTER TABLE [dbo].[foodvibes_geotrack] ADD  CONSTRAINT [PK_foodvibes_geotrack] PRIMARY KEY CLUSTERED 
(
	[ledger_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
CREATE NONCLUSTERED INDEX [IX_foodvibes_geotrack] ON [dbo].[foodvibes_geotrack]
(
	[geotrack_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[foodvibes_geotrack] ADD  DEFAULT ((0)) FOR [operation]
GO
ALTER TABLE [dbo].[foodvibes_geotrack] ADD  DEFAULT (getdate()) FOR [created_at]
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FoodVibes GeoTrack Ledger records' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'foodvibes_geotrack'
GO

CREATE TABLE [dbo].[foodvibes_product](
	[ledger_id] [int] IDENTITY(1,1) NOT NULL,
	[product_id] [nvarchar](64) NOT NULL,
	[description] [nvarchar](max) NOT NULL,
	[quantity] [int] NOT NULL,
    [storage_tier] [int] NOT NULL,
	[recorded_at] [datetime2](7) NULL,
	[properties] [nvarchar](max) NULL,
	[operation] [int] NULL,
    [image_id] [nvarchar](max) NULL,
	[created_at] [datetime2](7) NULL,
	[username] [nvarchar](max) NOT NULL,
	[ledger_start_transaction_id] [bigint] GENERATED ALWAYS AS transaction_id START HIDDEN NOT NULL,
	[ledger_end_transaction_id] [bigint] GENERATED ALWAYS AS transaction_id END HIDDEN NULL,
	[ledger_start_sequence_number] [bigint] GENERATED ALWAYS AS sequence_number START HIDDEN NOT NULL,
	[ledger_end_sequence_number] [bigint] GENERATED ALWAYS AS sequence_number END HIDDEN NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
WITH
(
SYSTEM_VERSIONING = ON (HISTORY_TABLE = [dbo].[foodvibes_product_history]), 
LEDGER = ON (LEDGER_VIEW = [dbo].[foodvibes_product_Ledger] (TRANSACTION_ID_COLUMN_NAME = [ledger_transaction_id], SEQUENCE_NUMBER_COLUMN_NAME = [ledger_sequence_number], OPERATION_TYPE_COLUMN_NAME = [ledger_operation_type], OPERATION_TYPE_DESC_COLUMN_NAME = [ledger_operation_type_desc]))
)
GO
ALTER TABLE [dbo].[foodvibes_product] ADD  CONSTRAINT [PK_foodvibes_product] PRIMARY KEY CLUSTERED 
(
	[ledger_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
CREATE NONCLUSTERED INDEX [IX_foodvibes_product] ON [dbo].[foodvibes_product]
(
	[product_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[foodvibes_product] ADD  DEFAULT ((0)) FOR [operation]
GO
ALTER TABLE [dbo].[foodvibes_product] ADD  DEFAULT (getdate()) FOR [created_at]
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FoodVibes Product Ledger records' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'foodvibes_product'
GO

CREATE TABLE [dbo].[foodvibes_tracking_products](
	[ledger_id] [int] IDENTITY(1,1) NOT NULL,
	[geotrack_ledger_id] [int] NOT NULL,
	[geotrack_tx_id] [int] NOT NULL,
	[product_ledger_id] [int] NOT NULL,
	[product_tx_id] [int] NOT NULL,
    [product_aggregation] [int] NOT NULL,
	[notes] [nvarchar](max) NULL,
	[recorded_at] [datetime2](7) NULL,
	[properties] [nvarchar](max) NULL,
	[operation] [int] NULL,
	[created_at] [datetime2](7) NULL,
	[username] [nvarchar](max) NOT NULL,
	[ledger_start_transaction_id] [bigint] GENERATED ALWAYS AS transaction_id START HIDDEN NOT NULL,
	[ledger_end_transaction_id] [bigint] GENERATED ALWAYS AS transaction_id END HIDDEN NULL,
	[ledger_start_sequence_number] [bigint] GENERATED ALWAYS AS sequence_number START HIDDEN NOT NULL,
	[ledger_end_sequence_number] [bigint] GENERATED ALWAYS AS sequence_number END HIDDEN NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
WITH
(
SYSTEM_VERSIONING = ON (HISTORY_TABLE = [dbo].[foodvibes_tracking_products_history]), 
LEDGER = ON (LEDGER_VIEW = [dbo].[foodvibes_tracking_products_Ledger] (TRANSACTION_ID_COLUMN_NAME = [ledger_transaction_id], SEQUENCE_NUMBER_COLUMN_NAME = [ledger_sequence_number], OPERATION_TYPE_COLUMN_NAME = [ledger_operation_type], OPERATION_TYPE_DESC_COLUMN_NAME = [ledger_operation_type_desc]))
)
GO
ALTER TABLE [dbo].[foodvibes_tracking_products] ADD  CONSTRAINT [PK_foodvibes_ledger_id] PRIMARY KEY CLUSTERED 
(
	[ledger_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX [IX_foodvibes_tracking_products0] ON [dbo].[foodvibes_tracking_products]
(
	[geotrack_ledger_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
CREATE NONCLUSTERED INDEX [IX_foodvibes_tracking_products1] ON [dbo].[foodvibes_tracking_products]
(
	[product_ledger_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, DROP_EXISTING = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[foodvibes_tracking_products] ADD  DEFAULT ((0)) FOR [operation]
GO
ALTER TABLE [dbo].[foodvibes_tracking_products] ADD  DEFAULT (getdate()) FOR [created_at]
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FoodVibes Tracking Ledger records' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'foodvibes_tracking_products'
GO

CREATE TABLE [dbo].[foodvibes_sc_group](
	[ledger_id] [int] IDENTITY(1,1) NOT NULL,
	[sc_group_id] [nvarchar](max) NULL,
	[description] [nvarchar](max) NULL,
    [deleted] [bit] NULL,
	[operation] [int] NULL,
	[created_at] [datetime2](7) NULL,
	[username] [nvarchar](max) NOT NULL,
	[ledger_start_transaction_id] [bigint] GENERATED ALWAYS AS transaction_id START HIDDEN NOT NULL,
	[ledger_end_transaction_id] [bigint] GENERATED ALWAYS AS transaction_id END HIDDEN NULL,
	[ledger_start_sequence_number] [bigint] GENERATED ALWAYS AS sequence_number START HIDDEN NOT NULL,
	[ledger_end_sequence_number] [bigint] GENERATED ALWAYS AS sequence_number END HIDDEN NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
WITH
(
SYSTEM_VERSIONING = ON (HISTORY_TABLE = [dbo].[foodvibes_sc_group_history]), 
LEDGER = ON (LEDGER_VIEW = [dbo].[foodvibes_sc_group_Ledger] (TRANSACTION_ID_COLUMN_NAME = [ledger_transaction_id], SEQUENCE_NUMBER_COLUMN_NAME = [ledger_sequence_number], OPERATION_TYPE_COLUMN_NAME = [ledger_operation_type], OPERATION_TYPE_DESC_COLUMN_NAME = [ledger_operation_type_desc]))
)
GO
ALTER TABLE [dbo].[foodvibes_sc_group] ADD  CONSTRAINT [PK_foodvibes_sc_group] PRIMARY KEY CLUSTERED 
(
	[ledger_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[foodvibes_sc_group] ADD  DEFAULT ((0)) FOR [operation]
GO
ALTER TABLE [dbo].[foodvibes_sc_group] ADD  DEFAULT (getdate()) FOR [created_at]
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FoodVibes Contants/Lookup records' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'foodvibes_sc_group'
GO

CREATE TABLE [dbo].[foodvibes_sc_user](
	[ledger_id] [int] IDENTITY(1,1) NOT NULL,
	[sc_user_id] [nvarchar](max) NOT NULL,
	[email_addr] [nvarchar](max) NULL,
	[phone]  [nvarchar](max) NULL,
    [access_mask] [int] NOT NULL,
    [deleted] [bit] NULL,
	[operation] [int] NULL,
	[created_at] [datetime2](7) NULL,
	[username] [nvarchar](max) NOT NULL,
	[ledger_start_transaction_id] [bigint] GENERATED ALWAYS AS transaction_id START HIDDEN NOT NULL,
	[ledger_end_transaction_id] [bigint] GENERATED ALWAYS AS transaction_id END HIDDEN NULL,
	[ledger_start_sequence_number] [bigint] GENERATED ALWAYS AS sequence_number START HIDDEN NOT NULL,
	[ledger_end_sequence_number] [bigint] GENERATED ALWAYS AS sequence_number END HIDDEN NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
WITH
(
SYSTEM_VERSIONING = ON (HISTORY_TABLE = [dbo].[foodvibes_sc_user_history]), 
LEDGER = ON (LEDGER_VIEW = [dbo].[foodvibes_sc_user_Ledger] (TRANSACTION_ID_COLUMN_NAME = [ledger_transaction_id], SEQUENCE_NUMBER_COLUMN_NAME = [ledger_sequence_number], OPERATION_TYPE_COLUMN_NAME = [ledger_operation_type], OPERATION_TYPE_DESC_COLUMN_NAME = [ledger_operation_type_desc]))
)
GO
ALTER TABLE [dbo].[foodvibes_sc_user] ADD  CONSTRAINT [PK_foodvibes_sc_user] PRIMARY KEY CLUSTERED 
(
	[ledger_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[foodvibes_sc_user] ADD  DEFAULT ((0)) FOR [operation]
GO
ALTER TABLE [dbo].[foodvibes_sc_user] ADD  DEFAULT (getdate()) FOR [created_at]
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FoodVibes Contants/Lookup records' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'foodvibes_sc_user'
GO

CREATE TABLE [dbo].[foodvibes_sc_circle](
	[ledger_id] [int] IDENTITY(1,1) NOT NULL,
	[sc_group_ledger_id] [int] NOT NULL,
	[sc_user_ledger_id] [int] NOT NULL,
	[access_mask] [int] NOT NULL,
    [deleted] [bit] NULL,
	[operation] [int] NULL,
	[created_at] [datetime2](7) NULL,
	[username] [nvarchar](max) NOT NULL,
	[ledger_start_transaction_id] [bigint] GENERATED ALWAYS AS transaction_id START HIDDEN NOT NULL,
	[ledger_end_transaction_id] [bigint] GENERATED ALWAYS AS transaction_id END HIDDEN NULL,
	[ledger_start_sequence_number] [bigint] GENERATED ALWAYS AS sequence_number START HIDDEN NOT NULL,
	[ledger_end_sequence_number] [bigint] GENERATED ALWAYS AS sequence_number END HIDDEN NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
WITH
(
SYSTEM_VERSIONING = ON (HISTORY_TABLE = [dbo].[foodvibes_sc_circle_history]), 
LEDGER = ON (LEDGER_VIEW = [dbo].[foodvibes_sc_circle_Ledger] (TRANSACTION_ID_COLUMN_NAME = [ledger_transaction_id], SEQUENCE_NUMBER_COLUMN_NAME = [ledger_sequence_number], OPERATION_TYPE_COLUMN_NAME = [ledger_operation_type], OPERATION_TYPE_DESC_COLUMN_NAME = [ledger_operation_type_desc]))
)
GO
ALTER TABLE [dbo].[foodvibes_sc_circle] ADD  CONSTRAINT [PK_foodvibes_sc_circle] PRIMARY KEY CLUSTERED 
(
	[ledger_id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[foodvibes_sc_circle] ADD  DEFAULT ((0)) FOR [operation]
GO
ALTER TABLE [dbo].[foodvibes_sc_circle] ADD  DEFAULT (getdate()) FOR [created_at]
GO
EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'FoodVibes Contants/Lookup records' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'foodvibes_sc_circle'
GO

-- Create views
CREATE VIEW [dbo].[foodvibes_geotrack_ledger_view] AS
with constants_cte as (
    select constant_name, constant_value from dbo.foodvibes_constants where group_name like 'operation'
),
geotrack_cte as (
    select '0' [is_history], ledger_id, geotrack_id, [name], details, latitude, longitude, recorded_at, properties, operation, image_id, created_at, username, ledger_start_transaction_id from dbo.foodvibes_geotrack
    union
    select '1' [is_history], ledger_id, geotrack_id, [name], details, latitude, longitude, recorded_at, properties, operation, image_id, created_at, username, ledger_start_transaction_id from dbo.foodvibes_geotrack_history
)
-- need synthetic id column to avoid sqlacodegen error where it sees no unique key and cannot access the ORM view class
select ISNULL(CAST((row_number() over (order by g.ledger_id, g.ledger_start_transaction_id)) as int), 0) as orm_id
    ,g.is_history
    ,g.ledger_id [geotrack_ledger_id]
    ,g.ledger_start_transaction_id [geotrack_tx_id]
    ,g.geotrack_id
    ,g.name
    ,g.details
    ,g.latitude
    ,g.longitude
    ,g.recorded_at
    ,g.properties
    ,c.constant_name [operation_name]
    ,g.image_id
    ,'' [image_url]
    ,g.created_at
    ,g.username
from geotrack_cte g left join constants_cte c on c.constant_value = g.operation
;
GO

CREATE VIEW [dbo].[foodvibes_product_ledger_view] AS
with constants_cte as (
    select constant_name, constant_value from dbo.foodvibes_constants where group_name like 'operation'
),
product_cte as (
    select '0' [is_history], ledger_id, product_id, [description], quantity, storage_tier, recorded_at, properties, operation, image_id, created_at, username, ledger_start_transaction_id from dbo.foodvibes_product
    union
    select '1' [is_history], ledger_id, product_id, [description], quantity, storage_tier, recorded_at, properties, operation, image_id, created_at, username, ledger_start_transaction_id from dbo.foodvibes_product_history
)
-- need synthetic id column to avoid sqlacodegen error where it sees no unique key and cannot access the ORM view class
select ISNULL(CAST((row_number() over (order by p.ledger_id, p.ledger_start_transaction_id)) as int), 0) as orm_id
    ,p.is_history
    ,p.ledger_id [product_ledger_id]
    ,p.ledger_start_transaction_id [product_tx_id]
    ,p.product_id
    ,p.description
    ,p.quantity
    ,p.storage_tier
    ,p.recorded_at
    ,p.properties
    ,c.constant_name [operation_name]
    ,p.image_id
    ,'' [image_url]
    ,p.created_at
    ,p.username
from product_cte p left join constants_cte c on c.constant_value = p.operation
;
GO

CREATE VIEW [dbo].[foodvibes_tracking_products_ledger_view] AS
with constants_cte as (
    select constant_name, constant_value from dbo.foodvibes_constants where group_name like 'operation'
),
geotrack_cte as (
    select
         g.is_history [geotrack_is_history]
        ,g.geotrack_ledger_id
        ,g.geotrack_tx_id
        ,g.geotrack_id
        ,g.name
        ,g.details
        ,isnull(g.latitude, 0) [latitude]
        ,isnull(g.longitude, 0) [longitude]
        ,case
        when isnull(g.recorded_at, '') = '' then g.created_at
        else g.recorded_at
        end [geotrack_recorded_at]
        ,g.properties [geotrack_properties]
        ,g.operation_name [geotrack_operation_name]
        ,g.image_id [geotrack_image_id]
        ,'' [geotrack_image_url]
        ,g.created_at [geotrack_created_at]
        ,g.username [geotrack_username]
    from dbo.foodvibes_geotrack_ledger_view g
),
product_cte as (
    select
         p.is_history [product_is_history]
        ,p.product_ledger_id
        ,p.product_tx_id
        ,p.product_id
        ,p.description
        ,p.quantity
        ,p.storage_tier
        ,case
        when isnull(p.recorded_at, '') = '' then p.created_at
        else p.recorded_at
        end [product_recorded_at]
        ,p.properties [product_properties]
        ,p.operation_name [product_operation_name]
        ,p.image_id [product_image_id]
        ,'' [product_image_url]
        ,p.created_at [product_created_at]
        ,p.username [product_username]
    from dbo.foodvibes_product_ledger_view p
),
tracking_products_0_cte as (
    select
         '0' [is_history]
        ,t.ledger_id [tracking_products_ledger_id]
        ,isnull(t.ledger_start_transaction_id, 0) [tracking_products_tx_id]
        ,t.product_aggregation
        ,t.notes
        ,case
        when isnull(t.recorded_at, '') = '' then t.created_at
        else t.recorded_at
        end [recorded_at]
        ,t.properties
        ,c.constant_name [operation_name]
        ,t.created_at
        ,t.username
        ,g.*
        ,p.*
    from dbo.foodvibes_tracking_products t
    left join constants_cte c on c.constant_value = t.operation
    left join geotrack_cte g on g.geotrack_ledger_id = t.geotrack_ledger_id
    left join product_cte p on p.product_ledger_id = t.product_ledger_id
    where geotrack_is_history = '0' and product_is_history = '0'
),
tracking_products_1_cte as (
    select
         '1' [is_history]
        ,t.ledger_id [tracking_products_ledger_id]
        ,t.ledger_start_transaction_id [tracking_products_tx_id]
        ,t.product_aggregation
        ,t.notes
        ,case
        when isnull(t.recorded_at, '') = '' then t.created_at
        else t.recorded_at
        end [recorded_at]
        ,t.properties
        ,c.constant_name [operation_name]
        ,t.created_at
        ,t.username
        ,g.*
        ,p.*
    from dbo.foodvibes_tracking_products_history t
    left join constants_cte c on c.constant_value = t.operation
    left join geotrack_cte g on g.geotrack_ledger_id = t.geotrack_ledger_id and g.geotrack_tx_id = t.geotrack_tx_id
    left join product_cte p on p.product_ledger_id = t.product_ledger_id and p.product_tx_id = t.product_tx_id
),
tracking_products_all_cte as (
    select * from tracking_products_0_cte
    union
    select * from tracking_products_1_cte
),
tracking_products_final_cte as (
    select top 100 PERCENT
         *
        ,dense_rank() over(partition by tracking_products_ledger_id order by tracking_products_ledger_id asc, tracking_products_tx_id asc, geotrack_ledger_id asc, geotrack_tx_id asc, product_ledger_id asc, product_tx_id asc) [rank_curr_ledger_id]
        ,lag(latitude, 1) over (order by tracking_products_ledger_id asc, tracking_products_tx_id asc) [prev_latitude]
        ,lag(longitude, 1) over (order by tracking_products_ledger_id asc, tracking_products_tx_id asc) [prev_longitude]
        ,lag(product_ledger_id, 1) over (order by tracking_products_ledger_id asc, tracking_products_tx_id asc) [prev_product_ledger_id]
    from tracking_products_all_cte
    order by
         tracking_products_ledger_id
        ,tracking_products_tx_id
        ,geotrack_ledger_id
        ,geotrack_tx_id
        ,product_ledger_id
        ,product_tx_id
)
-- need synthetic id column to avoid sqlacodegen error where it sees no unique key and cannot access the ORM view class
select
     ISNULL(CAST((row_number() over (order by a.tracking_products_ledger_id, a.tracking_products_tx_id)) as int), 0) as orm_id
    ,a.*
    ,case
    when a.rank_curr_ledger_id = 1 or a.rank_curr_ledger_id > 1 and (a.prev_latitude <> a.latitude or a.prev_longitude <> a.longitude) then 1
    else 0
    end [geotrack_movement]
from tracking_products_final_cte a
;
GO

CREATE VIEW [dbo].[foodvibes_sc_group_ledger_view] AS
with constants_cte as (
    select constant_name, constant_value from dbo.foodvibes_constants where group_name like 'operation'
),
sc_group_cte as (
    select '0' [is_history], ledger_id, sc_group_id, description, operation, created_at, username, deleted, ledger_start_transaction_id from dbo.foodvibes_sc_group
    union
    select '1' [is_history], ledger_id, sc_group_id, description, operation, created_at, username, deleted, ledger_start_transaction_id from dbo.foodvibes_sc_group_history
)
-- need synthetic id column to avoid sqlacodegen error where it sees no unique key and cannot access the ORM view class
select ISNULL(CAST((row_number() over (order by s.ledger_id, s.ledger_start_transaction_id)) as int), 0) as orm_id
    ,s.is_history
    ,s.ledger_id [sc_group_ledger_id]
    ,s.ledger_start_transaction_id [sc_group_tx_id]
    ,s.sc_group_id
    ,s.description
    ,c.constant_name [operation_name]
    ,s.created_at
    ,s.username
from sc_group_cte s left join constants_cte c on c.constant_value = s.operation
where isnull(s.deleted, 0) = 0
;
GO

CREATE VIEW [dbo].[foodvibes_sc_user_ledger_view] AS
with constants_cte as (
    select constant_name, constant_value from dbo.foodvibes_constants where group_name like 'operation'
),
sc_user_cte as (
    select '0' [is_history], ledger_id, sc_user_id, email_addr, phone, access_mask, operation, created_at, username, deleted, ledger_start_transaction_id from dbo.foodvibes_sc_user
    union
    select '1' [is_history], ledger_id, sc_user_id, email_addr, phone, access_mask, operation, created_at, username, deleted, ledger_start_transaction_id from dbo.foodvibes_sc_user_history
)
-- need synthetic id column to avoid sqlacodegen error where it sees no unique key and cannot access the ORM view class
select ISNULL(CAST((row_number() over (order by u.ledger_id, u.ledger_start_transaction_id)) as int), 0) as orm_id
    ,u.is_history
    ,u.ledger_id [sc_user_ledger_id]
    ,u.ledger_start_transaction_id [sc_user_tx_id]
    ,u.sc_user_id
	,u.email_addr
	,u.phone
    ,u.access_mask
    ,f.active_roles
    ,f.active_roles_long
    ,c.constant_name [operation_name]
    ,u.created_at
    ,u.username
from sc_user_cte u left join constants_cte c on c.constant_value = u.operation
cross apply dbo.foodvibes_get_role_names_from_access_mask(u.access_mask) f
where isnull(u.deleted, 0) = 0
;
GO



CREATE VIEW [dbo].[foodvibes_sc_circle_ledger_view] AS
with constants_cte as (
    select constant_name, constant_value from dbo.foodvibes_constants where group_name like 'operation'
),
sc_user_cte as (
    select
	     u.is_history [sc_user_is_history]
        ,u.sc_user_ledger_id
        ,u.sc_user_tx_id
        ,u.sc_user_id
        ,u.email_addr
        ,u.phone
        ,u.access_mask [sc_user_access_mask]
        ,u.active_roles [sc_user_active_roles]
        ,u.active_roles_long [sc_user_active_roles_long]
        ,u.operation_name [sc_user_operation_name]
        ,u.created_at [sc_user_created_at]
        ,u.username [sc_user_username]
    from dbo.foodvibes_sc_user_ledger_view u
),
sc_group_cte as (
    select
	     s.is_history [sc_group_is_history]
        ,s.sc_group_ledger_id
        ,s.sc_group_tx_id
        ,s.sc_group_id
        ,s.description [sc_group_description]
        ,s.operation_name [sc_group_operation_name]
        ,s.created_at [sc_group_created_at]
        ,s.username [sc_group_username]
    from dbo.foodvibes_sc_group_ledger_view s
),
sc_circle_0_cte as (
    select
         '0' [is_history]
        ,t.ledger_id [sc_circle_ledger_id]
        ,isnull(t.ledger_start_transaction_id, 0) [sc_circle_tx_id]
		,t.access_mask
        ,c.constant_name [operation_name]
        ,t.created_at
        ,t.username
        ,u.*
        ,g.*
    from dbo.foodvibes_sc_circle t left join constants_cte c on c.constant_value = t.operation
    left join sc_user_cte u on u.sc_user_ledger_id = t.sc_user_ledger_id
    left join sc_group_cte g on g.sc_group_ledger_id = t.sc_group_ledger_id
    where isnull(t.deleted, 0) = 0 and sc_user_is_history = '0' and sc_group_is_history = '0'
),
sc_circle_1_cte as (
    select
         '1' [is_history]
        ,t.ledger_id [sc_circle_ledger_id]
        ,isnull(t.ledger_start_transaction_id, 0) [sc_circle_tx_id]
		,t.access_mask
        ,c.constant_name [operation_name]
        ,t.created_at
        ,t.username
        ,u.*
        ,g.*
    from dbo.foodvibes_sc_circle t left join constants_cte c on c.constant_value = t.operation
    left join sc_user_cte u on u.sc_user_ledger_id = t.sc_user_ledger_id
    left join sc_group_cte g on g.sc_group_ledger_id = t.sc_group_ledger_id
    where isnull(t.deleted, 0) = 0 and sc_user_is_history = '1' and sc_group_is_history = '1'
),
sc_circle_all_cte as (
    select * from sc_circle_0_cte
    union
    select * from sc_circle_1_cte
)
-- need synthetic id column to avoid sqlacodegen error where it sees no unique key and cannot access the ORM view class
select top 100 PERCENT
     ISNULL(CAST((row_number() over (order by a.sc_circle_ledger_id, a.sc_circle_tx_id)) as int), 0) as orm_id
    ,a.*
    ,f.*
from sc_circle_all_cte a
cross apply dbo.foodvibes_get_role_names_from_access_mask(a.access_mask) f
order by
     a.sc_circle_ledger_id
    ,a.sc_circle_tx_id
    ,a.sc_group_ledger_id
    ,a.sc_group_tx_id
    ,a.sc_user_ledger_id
    ,a.sc_user_tx_id
;
GO

-- Populate database with constants data
insert into dbo.foodvibes_constants (group_name, constant_name, constant_value) values ('operation', 'create', 0);
insert into dbo.foodvibes_constants (group_name, constant_name, constant_value) values ('operation', 'update', 1);

select * from dbo.foodvibes_constants;
select * from dbo.foodvibes_geotrack_ledger_view;
select * from dbo.foodvibes_product_ledger_view;
select * from dbo.foodvibes_tracking_products_ledger_view;
select * from dbo.foodvibes_sc_user_ledger_view;
select * from dbo.foodvibes_sc_group_ledger_view;
select * from dbo.foodvibes_sc_circle_ledger_view;
GO
