import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Award, Mail, CircleDollarSign, MapPin } from 'lucide-react';
import Table from '../../components/Table/Table';
import type { Column } from '../../components/Table/Table';
import type { User } from './helper';
import { formatRate, getRoleBadgeClass, getRoleLabel } from './helper';
import { callAPI, urls } from '../../services/api';
import { useSnackbar } from '../../context/SnackbarContext';
import './UserList.scss';

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await callAPI(urls.userList, 'GET');
        if (res && res.success) {
          setUsers(res.data);
        }
      } catch (err: any) {
        showSnackbar(err.message || 'Failed to load staff list', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [showSnackbar]);

  const columns: Column<User>[] = [
    {
      key: 'id',
      header: 'Staff ID',
      className: 'w-24',
      render: (user) => (
        <span className="user-id-badge">
          #{user.id}
        </span>
      )
    },
    {
      key: 'name',
      header: 'Full Name & Email',
      render: (user) => (
        <div className="user-info-cell">
          <span className="user-name">{user.name}</span>
          <span className="user-email-row">
            <Mail className="user-email-icon" />
            {user.email}
          </span>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Access Rights / Role',
      className: 'w-44',
      render: (user) => (
        <span className={getRoleBadgeClass(user.role)}>
          {getRoleLabel(user.role)}
        </span>
      )
    },
    {
      key: 'location',
      header: 'City Location',
      className: 'w-36',
      render: (user) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={14} style={{ color: 'var(--color-text-secondary)' }} />
          <span>{user.location || 'N/A (Pusat)'}</span>
        </div>
      )
    },
    {
      key: 'availability',
      header: 'Availability Status',
      className: 'w-40',
      render: (user) => {
        if (user.role === 'admin') return <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>N/A</span>;
        return (
          <span className={`badge-status ${user.availability ? 'status-transcribed' : 'status-review_in_progress'}`} style={{
            backgroundColor: user.availability ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
            color: user.availability ? '#34d399' : '#94a3b8',
            borderColor: user.availability ? 'rgba(16, 185, 129, 0.2)' : 'rgba(100, 116, 139, 0.2)'
          }}>
            {user.availability ? 'Available' : 'Busy'}
          </span>
        );
      }
    },
    {
      key: 'baseRate',
      header: 'Base Rate',
      render: (user) => (
        <div className="rate-cell">
          <CircleDollarSign className="rate-icon" />
          <span className="rate-value">{formatRate(user.baseRate, user.role)}</span>
        </div>
      )
    },
    {
      key: 'activeJobsCount',
      header: 'Active Jobs',
      className: 'w-36 text-center',
      render: (user) => (
        <span className={`active-jobs-badge ${
          user.activeJobsCount && user.activeJobsCount > 0 ? 'jobs-active' : 'jobs-empty'
        }`}>
          {user.activeJobsCount || 0} jobs
        </span>
      )
    }
  ];

  return (
    <div className="users-page-container animate-fade-in">
      {/* Page Title Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users className="page-title-icon" />
            <span>Staff & User Management (Users)</span>
          </h1>
          <p className="page-subtitle">Manage user licenses, court profiles, and base rate configurations for staff salary calculations.</p>
        </div>

        <Link to="/users/create" className="btn-base btn-primary btn-md">
          <UserPlus style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', flexShrink: 0 }} />
          <span>Register New Staff</span>
        </Link>
      </div>

      <div className="page-content-full">
        <div className="table-section-header">
          <h2 className="table-title">
            <Award className="table-title-icon" />
            <span>All System Users List</span>
          </h2>
          <span className="badge-counter">
            {users.length} Registered
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Loading staff data from server...
          </div>
        ) : (
          <Table<User>
            columns={columns}
            data={users}
            rowKey={(user) => user.id}
            emptyMessage="No staff or users registered."
          />
        )}
      </div>
    </div>
  );
};

export default UserList;
