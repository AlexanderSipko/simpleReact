//my-react-app/src/elements/hooks/useTableConfig.jsx

import { useMemo } from 'react';
import { createColumn } from '../factories/columnFactory';
import { 
  getUniqueFilters,
} from '../helpers/tableHelpers';

export const useTableConfig = (posts = []) => {

  const statusFilters = useMemo(() => 
    getUniqueFilters(posts, 'status'), 
  [posts]);

  const dateFilters = useMemo(() => 
    getUniqueFilters(posts, 'createdAt'), 
  [posts]);

  // определяем поля, и 
  const columns = useMemo(() => [
        createColumn('id', { title: 'ID' }),
        createColumn('title', { width: 300 }),
        createColumn('status', { forFilters: statusFilters, width: 50 }),
        createColumn('createdAt', { title: 'Дата создания',  forFilters: dateFilters}, posts),
        createColumn('actions')
  ], [statusFilters]);

  return {
    columns,
    dataSource: posts
  };
};

