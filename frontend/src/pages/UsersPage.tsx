import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { getUserClocks, toggleClock } from '@/services/clocks'
import type { User } from '@/types/users'
import {
	Box,
	Typography,
	Card,
	Avatar,
	Button,
	CircularProgress,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableSortLabel,
	Chip,
	Divider,
	Stack,
} from '@mui/material'
import { AccessTime, Schedule, BusinessCenter, Person } from '@mui/icons-material'

export default function UserPage() {
	const USER_ID = 1 // utilisateur fixe / données en dur

	const [user, setUser] = useState<User | null>(null)
	const [clocks, setClocks] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [processing, setProcessing] = useState(false)
	const [isClockedIn, setIsClockedIn] = useState(false)
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

	// Calculate total working hours for today
	const getTodayWorkingHours = () => {
		const today = new Date().toDateString()
		const todayClocks = clocks.filter(clock =>
			new Date(clock.clock_in).toDateString() === today
		)

		let totalMinutes = 0
		todayClocks.forEach(clock => {
			if (clock.clock_out) {
				const clockIn = new Date(clock.clock_in)
				const clockOut = new Date(clock.clock_out)
				totalMinutes += (clockOut.getTime() - clockIn.getTime()) / (1000 * 60)
			}
		})

		const hours = Math.floor(totalMinutes / 60)
		const minutes = Math.floor(totalMinutes % 60)
		return `${hours}h ${minutes}m`
	}

	// --- CHARGEMENT DES DONNÉES UTILISATEUR + CLOCKS ---
	useEffect(() => {
		const fetchData = async () => {
			try {
				const userRes = await api.get(`/users/${USER_ID}`)
				setUser(userRes.data)

				const userClocks = await getUserClocks(USER_ID)
				setClocks(userClocks)

				// Vérifie si un clock actif existe
				const activeClock = userClocks.some((c: any) => c.clock_out === null)
				setIsClockedIn(activeClock)
			} catch (err) {
				console.error('❌ Error Loading user :', err)
			} finally {
				setLoading(false)
			}
		}
		fetchData()
	}, [])

	// --- CLOCK IN / OUT ---
	const handleClock = async () => {
		setProcessing(true)
		try {
			const res = await toggleClock(USER_ID)
			const updatedClocks = await getUserClocks(USER_ID)
			setClocks(updatedClocks)
			setIsClockedIn(res.clock_out === null)
		} catch (err) {
			alert('Error during Clock In/Out')
		} finally {
			setProcessing(false)
		}
	}

	// --- TRI DES CLOCKS ---
	const sortedClocks = [...clocks].sort((a, b) => {
		const dateA = new Date(a.clock_in).getTime()
		const dateB = new Date(b.clock_in).getTime()
		return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
	})

	const handleSort = () => {
		setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
	}

	// --- AFFICHAGE EN CAS DE CHARGEMENT / ERREUR ---
	if (loading)
		return (
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100vh',
					background: 'linear-gradient(135deg, #0f1419 0%, #1a2332 50%, #2d3748 100%)',
				}}
			>
				<Card
					sx={{
						background: 'rgba(255, 255, 255, 0.05)',
						backdropFilter: 'blur(20px)',
						borderRadius: '20px',
						border: '1px solid rgba(255, 255, 255, 0.1)',
						boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
						p: 6,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						gap: 3,
					}}
				>
					<CircularProgress
						size={60}
						thickness={3}
						sx={{
							color: '#3b82f6',
							'& .MuiCircularProgress-circle': {
								strokeLinecap: 'round',
							}
						}}
					/>
					<Typography
						variant="h6"
						sx={{
							color: 'rgba(255, 255, 255, 0.9)',
							fontWeight: 500,
							letterSpacing: '0.5px'
						}}
					>
						Loading Employee Data...
					</Typography>
				</Card>
			</Box>
		)

	if (!user)
		return (
			<Box
				sx={{
					textAlign: 'center',
					height: '100vh',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: 'linear-gradient(135deg, #0f1419 0%, #1a2332 50%, #2d3748 100%)',
				}}
			>
				<Card
					sx={{
						background: 'rgba(255, 255, 255, 0.05)',
						backdropFilter: 'blur(20px)',
						borderRadius: '20px',
						border: '1px solid rgba(255, 255, 255, 0.1)',
						boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
						p: 6,
					}}
				>
					<Typography variant="h5" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>
						Employee Not Found
					</Typography>
				</Card>
			</Box>
		)

	// --- AFFICHAGE PRINCIPAL ---
	return (
		<Box
			sx={{
				minHeight: '100vh',
				background: 'linear-gradient(135deg, #0f1419 0%, #1a2332 50%, #2d3748 100%)',
				p: 4,
			}}
		>
			{/* Header */}
			<Box sx={{ mb: 4, textAlign: 'center' }}>
				<Typography
					variant="h3"
					sx={{
						color: 'rgba(255, 255, 255, 0.95)',
						fontWeight: 700,
						letterSpacing: '-0.5px',
						mb: 1,
					}}
				>
					Employee Time Management
				</Typography>
				<Typography
					variant="subtitle1"
					sx={{
						color: 'rgba(255, 255, 255, 0.6)',
						fontWeight: 400,
					}}
				>
					Professional Time Tracking System
				</Typography>
			</Box>

			<Box sx={{ display: 'flex', flexDirection: 'row', gap: 4, maxWidth: '1600px', margin: '0 auto' }}>
				{/* --- CARTE UTILISATEUR --- */}
				<Card
					elevation={0}
					sx={{
						width: 400,
						height: 'fit-content',
						background: 'rgba(255, 255, 255, 0.05)',
						backdropFilter: 'blur(20px)',
						borderRadius: '24px',
						border: '1px solid rgba(255, 255, 255, 0.1)',
						boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
						p: 4,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						position: 'sticky',
						top: '2rem',
					}}
				>
					{/* Profile Section */}
					<Box
						sx={{
							background: 'linear-gradient(145deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
							borderRadius: '50%',
							p: 2,
							mb: 3,
							border: '2px solid rgba(59, 130, 246, 0.2)',
						}}
					>
						<Avatar
							sx={{
								bgcolor: 'transparent',
								background: 'linear-gradient(145deg, #3b82f6, #8b5cf6)',
								color: 'white',
								width: 100,
								height: 100,
								fontSize: '2.5rem',
								fontWeight: 700,
								boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)',
							}}
						>
							{user.first_name ? user.first_name[0].toUpperCase() : <Person />}
						</Avatar>
					</Box>

					<Typography
						variant="h4"
						sx={{
							color: 'rgba(255, 255, 255, 0.95)',
							mb: 1,
							fontWeight: 600,
							textAlign: 'center',
							letterSpacing: '-0.3px',
						}}
					>
						{user.first_name} {user.last_name}
					</Typography>

					<Typography
						variant="body1"
						sx={{
							color: 'rgba(255, 255, 255, 0.7)',
							mb: 1,
							fontWeight: 400,
						}}
					>
						{user.email}
					</Typography>

					<Typography
						variant="body2"
						sx={{
							color: 'rgba(255, 255, 255, 0.6)',
							mb: 4,
						}}
					>
						{user.phone_number}
					</Typography>

					<Divider sx={{ width: '100%', mb: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

					{/* Today's Stats */}
					<Stack direction="row" spacing={3} sx={{ mb: 4, width: '100%' }}>
						<Box sx={{ flex: 1, textAlign: 'center' }}>
							<Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
								Today's Hours
							</Typography>
							<Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
								{getTodayWorkingHours()}
							</Typography>
						</Box>
						<Box sx={{ flex: 1, textAlign: 'center' }}>
							<Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
								Status
							</Typography>
							<Typography variant="h6" sx={{ color: isClockedIn ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
								{isClockedIn ? 'Active' : 'Inactive'}
							</Typography>
						</Box>
					</Stack>

					{/* Clock Button */}
					<Button
						variant="contained"
						size="large"
						disabled={processing}
						onClick={handleClock}
						startIcon={<AccessTime />}
						sx={{
							background: isClockedIn
								? 'linear-gradient(145deg, #dc2626, #b91c1c)'
								: 'linear-gradient(145deg, #059669, #047857)',
							border: 'none',
							borderRadius: '16px',
							px: 6,
							py: 2,
							color: 'white',
							fontWeight: 600,
							fontSize: '1.1rem',
							textTransform: 'none',
							boxShadow: isClockedIn
								? '0 10px 25px rgba(220, 38, 38, 0.3)'
								: '0 10px 25px rgba(5, 150, 105, 0.3)',
							mb: 3,
							width: '100%',
							'&:hover': {
								background: isClockedIn
									? 'linear-gradient(145deg, #b91c1c, #991b1b)'
									: 'linear-gradient(145deg, #047857, #065f46)',
								transform: 'translateY(-2px)',
								boxShadow: isClockedIn
									? '0 15px 35px rgba(220, 38, 38, 0.4)'
									: '0 15px 35px rgba(5, 150, 105, 0.4)',
							},
							'&:disabled': {
								background: 'rgba(255, 255, 255, 0.1)',
								color: 'rgba(255, 255, 255, 0.5)',
								boxShadow: 'none',
							}
						}}
					>
						{processing ? (
							<CircularProgress size={20} sx={{ color: 'white', mr: 1 }} />
						) : null}
						{processing ? 'Processing...' : isClockedIn ? 'Clock Out' : 'Clock In'}
					</Button>

					{/* Status Chip */}
					<Chip
						label={isClockedIn ? 'Currently Working' : 'Off Duty'}
						icon={isClockedIn ? <BusinessCenter /> : <Schedule />}
						sx={{
							background: isClockedIn
								? 'rgba(16, 185, 129, 0.15)'
								: 'rgba(245, 158, 11, 0.15)',
							color: isClockedIn ? '#10b981' : '#f59e0b',
							border: `1px solid ${isClockedIn ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
							fontWeight: 500,
							backdropFilter: 'blur(10px)',
							fontSize: '0.875rem',
							px: 1,
						}}
					/>
				</Card>

				{/* --- Time Records Table --- */}
				<Box sx={{ flex: 1 }}>
					<Card
						elevation={0}
						sx={{
							background: 'rgba(255, 255, 255, 0.05)',
							backdropFilter: 'blur(20px)',
							borderRadius: '24px',
							border: '1px solid rgba(255, 255, 255, 0.1)',
							boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
							overflow: 'hidden',
						}}
					>
						<Box sx={{ p: 4, pb: 0 }}>
							<Typography
								variant="h4"
								align="center"
								gutterBottom
								sx={{
									color: 'rgba(255, 255, 255, 0.95)',
									fontWeight: 600,
									letterSpacing: '-0.3px',
									mb: 1,
								}}
							>
								Time Records
							</Typography>
							<Typography
								variant="body2"
								align="center"
								sx={{
									color: 'rgba(255, 255, 255, 0.6)',
									mb: 4,
								}}
							>
								Complete history of clock in/out activities
							</Typography>
						</Box>

						<TableContainer
							component={Box}
							sx={{
								background: 'transparent',
								maxHeight: '65vh',
								'&::-webkit-scrollbar': {
									width: '8px',
								},
								'&::-webkit-scrollbar-track': {
									background: 'rgba(255, 255, 255, 0.05)',
									borderRadius: '4px',
								},
								'&::-webkit-scrollbar-thumb': {
									background: 'rgba(255, 255, 255, 0.2)',
									borderRadius: '4px',
									'&:hover': {
										background: 'rgba(255, 255, 255, 0.3)',
									}
								},
							}}
						>
							<Table stickyHeader>
								<TableHead>
									<TableRow>
										<TableCell
											sx={{
												color: 'rgba(255, 255, 255, 0.9)',
												fontWeight: 600,
												fontSize: '0.95rem',
												border: 'none',
												background: 'rgba(255, 255, 255, 0.03)',
												backdropFilter: 'blur(10px)',
												borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
											}}
										>
											Record ID
										</TableCell>
										<TableCell
											sx={{
												color: 'rgba(255, 255, 255, 0.9)',
												fontWeight: 600,
												fontSize: '0.95rem',
												border: 'none',
												background: 'rgba(255, 255, 255, 0.03)',
												backdropFilter: 'blur(10px)',
												borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
											}}
										>
											<TableSortLabel
												active={true}
												direction={sortOrder}
												onClick={handleSort}
												sx={{
													color: 'rgba(255, 255, 255, 0.9) !important',
													'& .MuiTableSortLabel-icon': {
														color: 'rgba(255, 255, 255, 0.9) !important',
													},
													'&:hover': {
														color: 'white !important',
													}
												}}
											>
												Clock In Time
											</TableSortLabel>
										</TableCell>
										<TableCell
											sx={{
												color: 'rgba(255, 255, 255, 0.9)',
												fontWeight: 600,
												fontSize: '0.95rem',
												border: 'none',
												background: 'rgba(255, 255, 255, 0.03)',
												backdropFilter: 'blur(10px)',
												borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
											}}
										>
											Clock Out Time
										</TableCell>
										<TableCell
											sx={{
												color: 'rgba(255, 255, 255, 0.9)',
												fontWeight: 600,
												fontSize: '0.95rem',
												border: 'none',
												background: 'rgba(255, 255, 255, 0.03)',
												backdropFilter: 'blur(10px)',
												borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
											}}
										>
											Duration
										</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{sortedClocks.length === 0 ? (
										<TableRow>
											<TableCell
												colSpan={4}
												align="center"
												sx={{
													color: 'rgba(255, 255, 255, 0.6)',
													border: 'none',
													py: 6,
													fontSize: '1rem',
													background: 'transparent',
												}}
											>
												No time records found
											</TableCell>
										</TableRow>
									) : (
										sortedClocks.map((clock: any) => {
											const clockIn = new Date(clock.clock_in)
											const clockOut = clock.clock_out ? new Date(clock.clock_out) : null
											const duration = clockOut
												? `${Math.floor((clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60))}h ${Math.floor(((clockOut.getTime() - clockIn.getTime()) % (1000 * 60 * 60)) / (1000 * 60))}m`
												: '-'

											return (
												<TableRow
													key={clock.id}
													sx={{
														'&:nth-of-type(even)': {
															background: 'rgba(255, 255, 255, 0.02)',
														},
														'&:hover': {
															background: 'rgba(255, 255, 255, 0.05)',
														},
														transition: 'all 0.2s ease',
													}}
												>
													<TableCell
														sx={{
															color: 'rgba(255, 255, 255, 0.8)',
															border: 'none',
															fontWeight: 500,
															borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
														}}
													>
														#{clock.id.toString().padStart(4, '0')}
													</TableCell>
													<TableCell
														sx={{
															color: 'rgba(255, 255, 255, 0.8)',
															border: 'none',
															fontFamily: 'monospace',
															borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
														}}
													>
														{clockIn.toLocaleString('en-GB', {
															day: '2-digit',
															month: '2-digit',
															year: 'numeric',
															hour: '2-digit',
															minute: '2-digit',
														})}
													</TableCell>
													<TableCell
														sx={{
															color: 'rgba(255, 255, 255, 0.8)',
															border: 'none',
															fontFamily: 'monospace',
															borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
														}}
													>
														{clockOut ? (
															clockOut.toLocaleString('en-GB', {
																day: '2-digit',
																month: '2-digit',
																year: 'numeric',
																hour: '2-digit',
																minute: '2-digit',
															})
														) : (
															<Chip
																label="In Progress"
																size="small"
																sx={{
																	background: 'rgba(16, 185, 129, 0.15)',
																	color: '#10b981',
																	border: '1px solid rgba(16, 185, 129, 0.3)',
																	fontWeight: 500,
																	fontSize: '0.75rem',
																}}
															/>
														)}
													</TableCell>
													<TableCell
														sx={{
															color: 'rgba(255, 255, 255, 0.8)',
															border: 'none',
															fontFamily: 'monospace',
															fontWeight: 500,
															borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
														}}
													>
														{duration}
													</TableCell>
												</TableRow>
											)
										})
									)}
								</TableBody>
							</Table>
						</TableContainer>
					</Card>
				</Box>
			</Box>
		</Box>
	)
}