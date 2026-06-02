import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { useSnackbar } from '../../context/SnackbarContext.js';
import { ArrowLeft, Briefcase, Plus, UserCheck } from 'lucide-react';
import Input from '../../components/Input/Input.js';
import Button from '../../components/Button/Button.js';
import type { JobInput } from '../JobList/helper';
import { callAPI, urls } from '../../services/api.js';
import './JobCreate.scss';

export const JobCreate: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<JobInput>({
    defaultValues: {
      audioDurationSeconds: 1800,
      location: 'remote',
    }
  });

  const onSubmit: SubmitHandler<JobInput> = (data) => {
    setIsSubmitting(true);
    
    const payload = {
      ...data,
      audioDurationSeconds: Number(data.audioDurationSeconds),
      location: data.location
    };

    callAPI(urls.jobCreate, 'POST', payload)
      .then((res) => {
        setIsSubmitting(false);
        if (res && res.success) {
          showSnackbar("New court trial reporting job successfully registered!", "success");
          reset();
          navigate('/'); // Redirect back to list page!
        }
      })
      .catch((err) => {
        setIsSubmitting(false);
        showSnackbar(err.message || 'Failed to register new trial', 'error');
      });
  };

  return (
    <div className="jobs-page-container animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Briefcase className="page-title-icon" />
            <span>Register New Trial</span>
          </h1>
          <p className="page-subtitle">Register a new court trial case for court audio recording.</p>
        </div>

        <Link to="/" className="btn-base btn-secondary">
          <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem', flexShrink: 0 }} />
          <span>Back to List</span>
        </Link>
      </div>

      <div className="create-page-content">
        <div className="create-form-wrapper">
          <section className="form-panel">
            <div className="panel-header">
              <h2 className="panel-title">
                <Plus className="panel-title-icon" />
                <span>Register New Trial</span>
              </h2>
              <p className="panel-subtitle">Register a new court trial case for court audio recording.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="form-element">
              {/* Title */}
              <Input 
                label="Case / Trial Title"
                {...register("title", { required: "Case title is required" })}
                placeholder="Example: Trial No. 42/Pdt.G/2026/PN"
                error={errors.title?.message}
              />

              {/* Description */}
              <Input 
                label="Case Description"
                textarea
                rows={2}
                {...register("description")}
                placeholder="Brief explanation, expert witnesses, or main demands..."
              />

              {/* Audio URL */}
              <Input 
                label="Audio Recording File Link"
                type="url"
                {...register("audioUrl", { 
                  required: "Audio recording link is required",
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: "Invalid URL (must start with http/https)"
                  }
                })}
                placeholder="https://storage.mahkamahagung.go.id/audio.mp3"
                error={errors.audioUrl?.message}
              />

              {/* Location Select */}
              <Input 
                label="Trial Location"
                select
                options={[
                  { value: 'remote', label: 'Remote / Online' },
                  { value: 'Jakarta', label: 'Jakarta (Physical)' },
                  { value: 'Surabaya', label: 'Surabaya (Physical)' },
                  { value: 'Bandung', label: 'Bandung (Physical)' },
                  { value: 'Medan', label: 'Medan (Physical)' }
                ]}
                {...register("location", { required: "Location must be selected" })}
                error={errors.location?.message}
              />

              {/* Duration (Detik) */}
              <Input 
                label="Audio Recording Duration (Seconds)"
                type="number"
                {...register("audioDurationSeconds", { 
                  required: "Recording duration is required",
                  min: { value: 1, message: "Minimum 1 second" }
                })}
                error={errors.audioDurationSeconds?.message}
              />

              {/* Submit Button */}
              <div className="submit-btn-wrapper">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  className="w-full"
                  icon={<UserCheck className="panel-title-icon" />}
                >
                  Register New Trial
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default JobCreate;
