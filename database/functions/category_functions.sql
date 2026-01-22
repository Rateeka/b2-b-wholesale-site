-- Recursive function to get category tree
CREATE OR REPLACE FUNCTION get_category_tree(parent_category_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  slug TEXT,
  parent_id UUID,
  sort_order INTEGER,
  is_active BOOLEAN,
  level INTEGER,
  path TEXT[]
) AS $$
WITH RECURSIVE category_tree AS (
  -- Base case: top-level categories or children of specified parent
  SELECT 
    c.id,
    c.name,
    c.description,
    c.slug,
    c.parent_id,
    c.sort_order,
    c.is_active,
    0 as level,
    ARRAY[c.name] as path
  FROM categories c
  WHERE c.parent_id IS NOT DISTINCT FROM parent_category_id
  
  UNION ALL
  
  -- Recursive case: children of current level
  SELECT 
    c.id,
    c.name,
    c.description,
    c.slug,
    c.parent_id,
    c.sort_order,
    c.is_active,
    ct.level + 1,
    ct.path || c.name
  FROM categories c
  INNER JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree
ORDER BY level, sort_order, name;
$$ LANGUAGE SQL STABLE;

-- Function to get all child category IDs (for filtering products by parent category)
CREATE OR REPLACE FUNCTION get_child_category_ids(parent_category_id UUID)
RETURNS UUID[] AS $$
WITH RECURSIVE category_children AS (
  SELECT id
  FROM categories
  WHERE id = parent_category_id
  
  UNION ALL
  
  SELECT c.id
  FROM categories c
  INNER JOIN category_children cc ON c.parent_id = cc.id
)
SELECT ARRAY_AGG(id) FROM category_children;
$$ LANGUAGE SQL STABLE;

-- Function to get category path (breadcrumb)
CREATE OR REPLACE FUNCTION get_category_path(category_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  level INTEGER
) AS $$
WITH RECURSIVE category_path AS (
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.parent_id,
    0 as level
  FROM categories c
  WHERE c.id = category_id
  
  UNION ALL
  
  SELECT 
    c.id,
    c.name,
    c.slug,
    c.parent_id,
    cp.level + 1
  FROM categories c
  INNER JOIN category_path cp ON c.id = cp.parent_id
)
SELECT id, name, slug, level
FROM category_path
ORDER BY level DESC;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION get_category_tree IS 'Returns hierarchical category tree with levels and paths';
COMMENT ON FUNCTION get_child_category_ids IS 'Returns array of all child category IDs for a given parent';
COMMENT ON FUNCTION get_category_path IS 'Returns breadcrumb path from root to specified category';
