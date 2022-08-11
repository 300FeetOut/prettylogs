import { useState } from "react"

import {
	useQuery,
} from "@tanstack/react-query"
import _ from 'lodash'
import styles from './projects.module.sass'


function Projects({projectSelected}) {
	const [currentProject, setCurrentProject] = useState(null)

	async function fetchProjects() {
		const response = await fetch(`/api/projects`)
		return await response.json()
	}

	const projectsQuery = useQuery(['projects'], fetchProjects, {})

	function selectProject(e) {
		const clickedProject = e.target.value
		setCurrentProject(clickedProject)
		projectSelected(clickedProject)
	}

	return <select className={styles.projects_wrapper} value={currentProject || ''} onChange={selectProject}>
		<option value={''}>Select project</option>
		{projectsQuery.data && projectsQuery.data.map((project) => {
			return <option key={project._id} value={project._id}>{project.name}</option>
		})}
	</select>
}

export default Projects