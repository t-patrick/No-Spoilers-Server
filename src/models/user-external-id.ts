import mongoose from '.';

const userExternalIdSchema = new mongoose.Schema<UserExternalIds>({
	userId: mongoose.SchemaTypes.ObjectId,
	TMDB_show_id: Number,
	websites: [
		{
			name: String,
			waybackUrl: String,
		}
	],
});

const UserExternalId = mongoose.model<UserExternalIds>('UserExternalId', userExternalIdSchema);

export default UserExternalId;
