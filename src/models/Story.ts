import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStory extends Document {
  title: string;
  content: string;
  images: Array<{
    url: string;
    publicId: string;
  }>;
  authorId: string;
  authorName: string;
  location: string;
  historicalPeriod?: string;
  tags: string[];
  upvotes: number;
  upvotedBy: string[];
  status: 'pending' | 'approved' | 'rejected';
  audioUrl?: string;
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
}

const StorySchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  images: [
    {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
  ],
  authorId: {
    type: String,
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  historicalPeriod: {
    type: String,
  },
  tags: {
    type: [String],
    default: [],
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  upvotedBy: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  audioUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  approvedAt: {
    type: Date,
  },
  approvedBy: {
    type: String,
  },
  rejectionReason: {
    type: String,
  },
});

// Index for efficient queries
StorySchema.index({ status: 1, createdAt: -1 });
StorySchema.index({ authorId: 1 });

// Force model re-creation to ensure schema updates are applied in dev mode
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.Story;
}

const Story: Model<IStory> = mongoose.models.Story || mongoose.model<IStory>('Story', StorySchema);

export default Story;
