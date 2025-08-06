import React, { useState } from 'react';
import styles from './DragAndDropContainer.module.css';

export default function DragAndDropContainer({ items, renderItem, onOrderChange }) {
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [order, setOrder] = useState(items.map((_, i) => i));

  const handleDragStart = idx => setDraggedIdx(idx);
  const handleDragOver = idx => e => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    setOrder(currentOrder => {
      const newOrder = [...currentOrder];
      const [removed] = newOrder.splice(draggedIdx, 1);
      newOrder.splice(idx, 0, removed);
      setDraggedIdx(idx);
      return newOrder;
    });
  };
  const handleDragEnd = () => {
    if (draggedIdx !== null) {
      const newItems = order.map(i => items[i]);
      onOrderChange(newItems);
    }
    setDraggedIdx(null);
  };

  React.useEffect(() => {
    setOrder(items.map((_, i) => i));
  }, [items]);

  return (
    <div className={styles.dndContainer}>
      {order.map((itemIdx, visualIdx) => (
        <div
          key={itemIdx}
          className={styles.dndItem}
          draggable
          onDragStart={() => handleDragStart(visualIdx)}
          onDragOver={handleDragOver(visualIdx)}
          onDragEnd={handleDragEnd}
        >
          {renderItem(items[itemIdx], itemIdx)}
        </div>
      ))}
    </div>
  );
} 