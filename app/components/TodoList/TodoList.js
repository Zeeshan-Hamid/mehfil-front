import React from "react";
import styles from "./TodoList.module.css";

export const TodoList = () => {
  const todoItems = [
    {
      icon: "/image-3.png",
      iconBg: "#a259ff",
      name: "Wedding",
      startDate: "03/12/2021",
      endDate: "5/12/2021",
      members: "5 Member",
    },
    {
      icon: "/image-3.png",
      iconBg: "#fe7c00",
      name: "Catering",
      startDate: "03/12/2021",
      endDate: "5/12/2021",
      members: "5 Member",
    },
  ];

  return (
    <div className={styles['todo-card']}>
      <div className={styles['todo-header']}>
        <h3 className={styles['todo-title']}>To Do</h3>
        <span className={styles['see-more']}>See More</span>
      </div>
      <div className={styles['todo-content']}>
        <table className={styles['todo-table']}>
          <thead>
            <tr>
              <th className={styles['table-header']}>Check Box</th>
              <th className={styles['table-header']}>
                Task Name
                <img
                  className={styles['arrow-down']}
                  alt="Arrow down"
                  src="/arrow---down-4.svg"
                />
              </th>
              <th className={styles['table-header']}>
                Start Date
                <img
                  className={styles['arrow-down']}
                  alt="Arrow down"
                  src="/arrow---down-4.svg"
                />
              </th>
              <th className={styles['table-header']}>
                End Date
                <img
                  className={styles['arrow-down']}
                  alt="Arrow down"
                  src="/arrow---down-4.svg"
                />
              </th>
              <th className={styles['table-header']}>
                Member
                <img
                  className={styles['arrow-down']}
                  alt="Arrow down"
                  src="/arrow---down-4.svg"
                />
              </th>
              <th className={styles['table-header']}>
                Status
                <img
                  className={styles['arrow-down']}
                  alt="Arrow down"
                  src="/arrow---down-4.svg"
                />
              </th>
              <th className={styles['table-header']}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {todoItems.map((item, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="checkbox"
                    className={styles['todo-checkbox']}
                  />
                </td>
                <td>
                  <div className={styles['task-name-cell']}>
                    <div
                      className={styles['task-icon']}
                      style={{ backgroundColor: `${item.iconBg}1a` }}
                    >
                      <img
                        className={styles['task-icon-img']}
                        alt="Task icon"
                        src={item.icon}
                      />
                    </div>
                    <span className={styles['task-name']}>{item.name}</span>
                  </div>
                </td>
                <td className={styles['start-date']}>{item.startDate}</td>
                <td className={styles['end-date']}>{item.endDate}</td>
                <td className={styles['members']}>{item.members}</td>
                <td>
                  <span className={styles['status-badge']}>Pending</span>
                </td>
                <td>
                  <div className={styles['action-buttons']}>
                    <img
                      className={styles['action-btn']}
                      alt="Edit"
                      src={`/edit${index === 0 ? "-1" : ""}.png`}
                    />
                    <img
                      className={styles['action-btn']}
                      alt="Delete"
                      src={`/delete${index === 0 ? "-1" : ""}.png`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
