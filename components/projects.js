import { useState, useEffect } from "react"

import {
	useQuery,
} from "@tanstack/react-query"
import _, { initial } from 'lodash'
import styles from './projects.module.sass'

import { setCookie, getCookie } from "../lib/utility"

function Projects({projectSelected}) {
	const [currentProject, setCurrentProject] = useState(null)

	async function fetchProjects() {
		console.log('fetching projects')
		const response = await fetch(`/api/projects`)
		return await response.json()
	}

	const projectsQuery = useQuery({
		queryKey: ['projects'],
		queryFn: fetchProjects
	})

	function selectProject(e) {
		const clickedProject = e.target.value
		setCurrentProject(clickedProject)
		projectSelected(clickedProject)
		setCookie('plog_project', clickedProject, 365)
	}

	useEffect(() => {
		const cookieProject = getCookie('plog_project')
		if (cookieProject) {
			setCurrentProject(cookieProject)
			projectSelected(cookieProject)
		}
	}, [])

	return <select className={styles.projects_wrapper} value={currentProject || ''} onChange={selectProject}>
		<option value={''}>Select project</option>
		{projectsQuery.data && projectsQuery.data.map((project) => {
			return <option key={project._id} value={project._id}>{project.name}</option>
		})}
	</select>
}

export default Projects