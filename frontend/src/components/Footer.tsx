import { Box, Typography } from '@mui/material'
import { Business, Code, Favorite } from '@mui/icons-material'

export default function Footer() {
  // return (
  //   <Box
  //     component="footer"
  //     sx={{
  //       py: 4,
  //       mt: 'auto',
  //       textAlign: 'center',
  //       background: 'rgba(255, 255, 255, 0.9)',
  //       backdropFilter: 'blur(8px)',
  //       borderTop: '1px solid rgba(148, 163, 184, 0.18)',
  //     }}
  //   >
  //     <Box
  //       sx={{
  //         display: 'flex',
  //         flexDirection: 'column',
  //         alignItems: 'center',
  //         gap: 2,
  //       }}
  //     >
  //       {/* Logo and Company */}
  //       <Box
  //         sx={{
  //           display: 'flex',
  //           alignItems: 'center',
  //           gap: 2,
  //           mb: 1,
  //         }}
  //       >
  //         <Box
  //           sx={{
  //             display: 'flex',
  //             alignItems: 'center',
  //             justifyContent: 'center',
  //             width: 32,
  //             height: 32,
  //             borderRadius: '10px',
  //             background: 'linear-gradient(135deg, #3B82F6, #38BDF8)',
  //             boxShadow: '0 4px 10px rgba(59, 130, 246, 0.2)',
  //           }}
  //         >
  //           <Business sx={{ fontSize: '1.2rem', color: '#0F172A' }} />
  //         </Box>
  //         <Typography
  //           variant="h6"
  //           sx={{
  //             color: '#1D4ED8',
  //             fontWeight: 700,
  //             letterSpacing: '-0.01em',
  //           }}
  //         >
  //           Enterprise Time Manager
  //         </Typography>
  //       </Box>

  //       {/* Copyright */}
  //       <Typography
  //         variant="body2"
  //         sx={{
  //           color: 'rgba(15, 23, 42, 0.65)',
  //           fontSize: '0.9rem',
  //           fontWeight: 400,
  //           letterSpacing: '0.5px',
  //         }}
  //       >
  //         © {new Date().getFullYear()} Time Manager. All rights reserved.
  //       </Typography>

  //       {/* Made with Love */}
  //       <Box
  //         sx={{
  //           display: 'flex',
  //           alignItems: 'center',
  //           gap: 1,
  //           mt: 1,
  //         }}
  //       >
  //         <Typography
  //           variant="caption"
  //           sx={{
  //             color: 'rgba(15, 23, 42, 0.55)',
  //             fontSize: '0.8rem',
  //             display: 'flex',
  //             alignItems: 'center',
  //             gap: 0.5,
  //           }}
  //         >
  //           Made with
  //           <Favorite
  //             sx={{
  //               fontSize: '0.9rem',
  //               color: '#EF4444',
  //               animation: 'heartbeat 2s infinite',
  //               '@keyframes heartbeat': {
  //                 '0%, 100%': { transform: 'scale(1)' },
  //                 '50%': { transform: 'scale(1.1)' },
  //               },
  //             }}
  //           />
  //           and
  //           <Code sx={{ fontSize: '0.9rem', color: '#0EA5E9' }} />
  //           for banking excellence
  //         </Typography>
  //       </Box>

  //       {/* Tech Stack Indicator */}
  //       <Box
  //         sx={{
  //           display: 'flex',
  //           gap: 1,
  //           mt: 2,
  //           opacity: 0.4,
  //         }}
  //       >
  //         {['React', 'TypeScript', 'MUI', 'Docker'].map((tech, index) => (
  //           <Box
  //             key={tech}
  //             sx={{
  //               px: 2,
  //               py: 0.5,
  //               borderRadius: '12px',
  //               background: 'rgba(59, 130, 246, 0.08)',
  //               border: '1px solid rgba(59, 130, 246, 0.18)',
  //               fontSize: '0.7rem',
  //               color: '#1D4ED8',
  //               fontWeight: 500,
  //               letterSpacing: '0.5px',
  //               textTransform: 'uppercase',
  //               transition: 'all 0.3s ease',
  //               animation: `fadeInUp 0.6s ease ${index * 0.1}s both`,
  //               '&:hover': {
  //                 background: 'rgba(59, 130, 246, 0.12)',
  //                 transform: 'translateY(-2px)',
  //               },
  //               '@keyframes fadeInUp': {
  //                 from: {
  //                   opacity: 0,
  //                   transform: 'translateY(10px)',
  //                 },
  //                 to: {
  //                   opacity: 1,
  //                   transform: 'translateY(0)',
  //                 },
  //               },
  //             }}
  //           >
  //             {tech}
  //           </Box>
  //         ))}
  //       </Box>
  //     </Box>
  //   </Box>
  // )
}
