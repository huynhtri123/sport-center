import React, { useState } from 'react';
import styles from '../../assets/css/manageFields.module.scss'; // Kiểm tra đường dẫn

function ManageFields() {
    // eslint-disable-next-line no-unused-vars
    const [fields, setFields] = useState([
        {
            id: 1,
            name: 'Football Field A',
            description: 'Standard size field',
            price: 100,
            image: '/images/fieldA.jpg',
        },
        { id: 2, name: 'Football Field B', description: 'Small size field', price: 80, image: '/images/fieldB.jpg' },
    ]);

    return (
        <div className={styles.manageFields}>
            <h2>Manage Football Fields</h2>
            <table className={styles.fieldsTable}>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Field Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Image</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {fields.map((field, index) => (
                        <tr key={field.id}>
                            <td>{index + 1}</td>
                            <td>{field.name}</td>
                            <td>{field.description}</td>
                            <td>${field.price}</td>
                            <td>
                                <img src={field.image} alt={field.name} className={styles.fieldImage} />
                            </td>
                            <td>
                                <button className={`btn ${styles.editButton}`}>Edit</button>
                                <button className={`btn ${styles.deleteButton}`}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button className={`btn ${styles.addButton}`}>Add New Field</button>
        </div>
    );
}

export default ManageFields;
