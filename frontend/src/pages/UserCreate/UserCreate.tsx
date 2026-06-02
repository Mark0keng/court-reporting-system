import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useSnackbar } from '../../context/SnackbarContext';
import { ArrowLeft, Users, Shield, UserPlus } from 'lucide-react';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import type { UserInput } from '../UserList/helper';
import { callAPI, urls } from '../../services/api';
import './UserCreate.scss';

export const UserCreate: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<UserInput>({
    defaultValues: {
      role: 'reporter',
      baseRate: 2500,
      location: 'Jakarta',
      availability: true
    }
  });

  const selectedRole = watch('role');

  const onSubmit: SubmitHandler<UserInput> = (data) => {
    setIsSubmitting(true);
    
    const payload = {
      ...data,
      baseRate: selectedRole === 'admin' ? 0 : Number(data.baseRate),
      location: selectedRole === 'admin' ? null : data.location,
      availability: selectedRole === 'admin' ? true : String(data.availability) === 'true'
    };

    callAPI(urls.userCreate, 'POST', payload)
      .then((res) => {
        setIsSubmitting(false);
        if (res && res.success) {
          showSnackbar(`Staff/User ${data.name} successfully registered!`, "success");
          reset();
          navigate('/users');
        }
      })
      .catch((err) => {
        setIsSubmitting(false);
        showSnackbar(err.message || 'Failed to register new staff', 'error');
      });
  };

  return (
    <div className="users-page-container animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users className="page-title-icon" />
            <span>Register New Staff</span>
          </h1>
          <p className="page-subtitle">Register a new operator, reporter, or editor into the system.</p>
        </div>

        <Link to="/users" className="btn-base btn-secondary">
          <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', flexShrink: 0 }} />
          <span>Back to List</span>
        </Link>
      </div>

      <div className="create-page-content">
        <div className="create-form-wrapper">
          <section className="form-panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <UserPlus className="panel-title-icon" />
                <span>Register New Staff</span>
              </h2>
              <p className="panel-subtitle">Register a new operator, reporter, or editor into the system.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="form-element">
              {/* Name */}
              <Input 
                label="Staff Full Name"
                {...register("name", { required: "Staff name is required" })}
                placeholder="Example: Ahmad Subardjo"
                error={errors.name?.message}
              />

              {/* Email */}
              <Input 
                label="Credential Email Address"
                type="email"
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address format"
                  }
                })}
                placeholder="ahmad@court.go.id"
                error={errors.email?.message}
              />

              {/* Role Select */}
              <Input 
                label="Select Access Rights / Role"
                select
                options={[
                  { value: 'reporter', label: 'Reporter (Recording & Transcription Officer)' },
                  { value: 'editor', label: 'Editor (Review Officer)' },
                  { value: 'admin', label: 'Administrator (Supervisor)' }
                ]}
                {...register("role")}
              />

              {/* Location */}
              {selectedRole !== 'admin' && (
                <Input 
                  label="Assignment City Location"
                  {...register("location", { required: "Assignment city location is required" })}
                  placeholder="Example: Jakarta"
                  error={errors.location?.message}
                />
              )}

              {/* Availability */}
              {selectedRole !== 'admin' && (
                <Input 
                  label="Availability Status"
                  select
                  options={[
                    { value: 'true', label: 'Available (Ready to be assigned)' },
                    { value: 'false', label: 'Busy (Handling another file)' }
                  ]}
                  {...register("availability")}
                />
              )}

              {/* Base Rate */}
              {selectedRole !== 'admin' && (
                <Input 
                  label={selectedRole === 'reporter' ? "Service Rate per Audio Minute (Rp)" : "Flat Fee per Court File (Rp)"}
                  type="number"
                  {...register("baseRate", { 
                    required: "Base service rate must be specified",
                    min: { value: 0, message: "Minimum rate is Rp 0" }
                  })}
                  helperText={
                    selectedRole === 'reporter' 
                      ? "Reporters are paid proportionally per minute of audio recording duration." 
                      : "Editors are paid a flat fee per completed file review."
                  }
                  error={errors.baseRate?.message}
                />
              )}

              {/* Submit Button */}
              <div className="submit-btn-wrapper">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  className="w-full"
                  icon={<Shield className="panel-title-icon" />}
                >
                  Register User
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserCreate;
